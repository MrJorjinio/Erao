using Erao.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;

namespace Erao.Infrastructure.Services;

public class MinioService : IMinioService
{
    private readonly IMinioClient _minioClient;
    private readonly ILogger<MinioService> _logger;
    private readonly string _bucketName;

    public MinioService(IConfiguration configuration, ILogger<MinioService> logger)
    {
        _logger = logger;

        var endpoint = configuration["Minio:Endpoint"] ?? "localhost:9000";
        var accessKey = configuration["Minio:AccessKey"] ?? "minioadmin";
        var secretKey = configuration["Minio:SecretKey"] ?? "minioadmin";
        var useSSL = configuration.GetValue<bool>("Minio:UseSSL", false);
        _bucketName = configuration["Minio:BucketName"] ?? "erao-files";

        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(useSSL)
            .Build();
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType, Guid userId)
    {
        await EnsureBucketExistsAsync();

        var objectName = GetObjectName(userId, fileName);

        var putObjectArgs = new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName)
            .WithStreamData(fileStream)
            .WithObjectSize(fileStream.Length)
            .WithContentType(contentType);

        await _minioClient.PutObjectAsync(putObjectArgs);

        _logger.LogInformation("File uploaded to MinIO: {ObjectName}", objectName);

        return objectName;
    }

    public async Task<Stream> DownloadFileAsync(string objectName)
    {
        var memoryStream = new MemoryStream();

        var getObjectArgs = new GetObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName)
            .WithCallbackStream(stream => stream.CopyTo(memoryStream));

        await _minioClient.GetObjectAsync(getObjectArgs);

        memoryStream.Position = 0;
        return memoryStream;
    }

    public async Task DeleteFileAsync(string objectName)
    {
        var removeObjectArgs = new RemoveObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(objectName);

        await _minioClient.RemoveObjectAsync(removeObjectArgs);

        _logger.LogInformation("File deleted from MinIO: {ObjectName}", objectName);
    }

    public async Task<bool> FileExistsAsync(string objectName)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName);

            await _minioClient.StatObjectAsync(statObjectArgs);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public string GetObjectName(Guid userId, string fileName)
    {
        return $"{userId}/{fileName}";
    }

    private async Task EnsureBucketExistsAsync()
    {
        var bucketExistsArgs = new BucketExistsArgs().WithBucket(_bucketName);
        var exists = await _minioClient.BucketExistsAsync(bucketExistsArgs);

        if (!exists)
        {
            var makeBucketArgs = new MakeBucketArgs().WithBucket(_bucketName);
            await _minioClient.MakeBucketAsync(makeBucketArgs);
            _logger.LogInformation("Created MinIO bucket: {BucketName}", _bucketName);
        }
    }
}
