using System.Data;
using System.Text;
using System.Text.Json;
using Erao.Core.Enums;
using Erao.Core.Interfaces;
using Microsoft.Extensions.Logging;
using MongoDB.Bson;
using MongoDB.Driver;
using MySql.Data.MySqlClient;
using Npgsql;
using System.Data.SqlClient;

namespace Erao.Infrastructure.Services;

public class DatabaseQueryService : IDatabaseQueryService
{
    private readonly ILogger<DatabaseQueryService> _logger;

    public DatabaseQueryService(ILogger<DatabaseQueryService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> TestConnectionAsync(DatabaseType dbType, string host, int port, string database, string username, string password)
    {
        try
        {
            switch (dbType)
            {
                case DatabaseType.PostgreSQL:
                    return await TestPostgreSqlConnectionAsync(host, port, database, username, password);
                case DatabaseType.MySQL:
                    return await TestMySqlConnectionAsync(host, port, database, username, password);
                case DatabaseType.SQLServer:
                    return await TestSqlServerConnectionAsync(host, port, database, username, password);
                case DatabaseType.MongoDB:
                    return await TestMongoDbConnectionAsync(host, port, database, username, password);
                default:
                    throw new NotSupportedException($"Database type {dbType} is not supported");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test connection for {DbType}", dbType);
            return false;
        }
    }

    public async Task<string> GetSchemaAsync(DatabaseType dbType, string host, int port, string database, string username, string password)
    {
        try
        {
            return dbType switch
            {
                DatabaseType.PostgreSQL => await GetPostgreSqlSchemaAsync(host, port, database, username, password),
                DatabaseType.MySQL => await GetMySqlSchemaAsync(host, port, database, username, password),
                DatabaseType.SQLServer => await GetSqlServerSchemaAsync(host, port, database, username, password),
                DatabaseType.MongoDB => await GetMongoDbSchemaAsync(host, port, database, username, password),
                _ => throw new NotSupportedException($"Database type {dbType} is not supported")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get schema for {DbType}", dbType);
            throw;
        }
    }

    public async Task<string> ExecuteQueryAsync(DatabaseType dbType, string host, int port, string database, string username, string password, string query)
    {
        try
        {
            return dbType switch
            {
                DatabaseType.PostgreSQL => await ExecutePostgreSqlQueryAsync(host, port, database, username, password, query),
                DatabaseType.MySQL => await ExecuteMySqlQueryAsync(host, port, database, username, password, query),
                DatabaseType.SQLServer => await ExecuteSqlServerQueryAsync(host, port, database, username, password, query),
                DatabaseType.MongoDB => await ExecuteMongoDbQueryAsync(host, port, database, username, password, query),
                _ => throw new NotSupportedException($"Database type {dbType} is not supported")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute query for {DbType}", dbType);
            throw;
        }
    }

    #region PostgreSQL

    private async Task<bool> TestPostgreSqlConnectionAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};Timeout=30";
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        return true;
    }

    private async Task<string> GetPostgreSqlSchemaAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        var schema = new StringBuilder();
        schema.AppendLine("-- PostgreSQL Database Schema");
        schema.AppendLine();

        var tableQuery = @"
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name";

        await using var tableCmd = new NpgsqlCommand(tableQuery, connection);
        await using var tableReader = await tableCmd.ExecuteReaderAsync();

        var tables = new List<string>();
        while (await tableReader.ReadAsync())
        {
            tables.Add(tableReader.GetString(0));
        }
        await tableReader.CloseAsync();

        foreach (var table in tables)
        {
            schema.AppendLine($"-- Table: {table}");
            schema.AppendLine($"CREATE TABLE {table} (");

            var columnQuery = @"
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = @tableName
                ORDER BY ordinal_position";

            await using var columnCmd = new NpgsqlCommand(columnQuery, connection);
            columnCmd.Parameters.AddWithValue("tableName", table);
            await using var columnReader = await columnCmd.ExecuteReaderAsync();

            var columns = new List<string>();
            while (await columnReader.ReadAsync())
            {
                var columnName = columnReader.GetString(0);
                var dataType = columnReader.GetString(1);
                var isNullable = columnReader.GetString(2) == "YES" ? "NULL" : "NOT NULL";
                columns.Add($"    {columnName} {dataType} {isNullable}");
            }
            await columnReader.CloseAsync();

            schema.AppendLine(string.Join(",\n", columns));
            schema.AppendLine(");");
            schema.AppendLine();
        }

        return schema.ToString();
    }

    private async Task<string> ExecutePostgreSqlQueryAsync(string host, int port, string database, string username, string password, string query)
    {
        var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = new NpgsqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();

        return await DataReaderToJsonAsync(reader);
    }

    #endregion

    #region MySQL

    private async Task<bool> TestMySqlConnectionAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = $"Server={host};Port={port};Database={database};User={username};Password={password};Connection Timeout=30";
        await using var connection = new MySqlConnection(connectionString);
        await connection.OpenAsync();
        return true;
    }

    private async Task<string> GetMySqlSchemaAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = $"Server={host};Port={port};Database={database};User={username};Password={password}";
        await using var connection = new MySqlConnection(connectionString);
        await connection.OpenAsync();

        var schema = new StringBuilder();
        schema.AppendLine("-- MySQL Database Schema");
        schema.AppendLine();

        var tableQuery = $"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '{database}'";
        await using var tableCmd = new MySqlCommand(tableQuery, connection);
        await using var tableReader = await tableCmd.ExecuteReaderAsync();

        var tables = new List<string>();
        while (await tableReader.ReadAsync())
        {
            tables.Add(tableReader.GetString(0));
        }
        await tableReader.CloseAsync();

        foreach (var table in tables)
        {
            schema.AppendLine($"-- Table: {table}");
            var showCreateQuery = $"SHOW CREATE TABLE `{table}`";
            await using var createCmd = new MySqlCommand(showCreateQuery, connection);
            await using var createReader = await createCmd.ExecuteReaderAsync();
            if (await createReader.ReadAsync())
            {
                schema.AppendLine(createReader.GetString(1));
            }
            await createReader.CloseAsync();
            schema.AppendLine();
        }

        return schema.ToString();
    }

    private async Task<string> ExecuteMySqlQueryAsync(string host, int port, string database, string username, string password, string query)
    {
        var connectionString = $"Server={host};Port={port};Database={database};User={username};Password={password}";
        await using var connection = new MySqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = new MySqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();

        return await DataReaderToJsonAsync(reader);
    }

    #endregion

    #region SQL Server

    private async Task<bool> TestSqlServerConnectionAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = $"Server={host},{port};Database={database};User Id={username};Password={password};TrustServerCertificate=True;Connection Timeout=30";
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        return true;
    }

    private async Task<string> GetSqlServerSchemaAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = $"Server={host},{port};Database={database};User Id={username};Password={password};TrustServerCertificate=True";
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var schema = new StringBuilder();
        schema.AppendLine("-- SQL Server Database Schema");
        schema.AppendLine();

        var tableQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
        await using var tableCmd = new SqlCommand(tableQuery, connection);
        await using var tableReader = await tableCmd.ExecuteReaderAsync();

        var tables = new List<string>();
        while (await tableReader.ReadAsync())
        {
            tables.Add(tableReader.GetString(0));
        }
        await tableReader.CloseAsync();

        foreach (var table in tables)
        {
            schema.AppendLine($"-- Table: {table}");
            schema.AppendLine($"CREATE TABLE [{table}] (");

            var columnQuery = @"
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = @tableName
                ORDER BY ORDINAL_POSITION";

            await using var columnCmd = new SqlCommand(columnQuery, connection);
            columnCmd.Parameters.AddWithValue("@tableName", table);
            await using var columnReader = await columnCmd.ExecuteReaderAsync();

            var columns = new List<string>();
            while (await columnReader.ReadAsync())
            {
                var columnName = columnReader.GetString(0);
                var dataType = columnReader.GetString(1);
                var isNullable = columnReader.GetString(2) == "YES" ? "NULL" : "NOT NULL";
                columns.Add($"    [{columnName}] {dataType} {isNullable}");
            }
            await columnReader.CloseAsync();

            schema.AppendLine(string.Join(",\n", columns));
            schema.AppendLine(");");
            schema.AppendLine();
        }

        return schema.ToString();
    }

    private async Task<string> ExecuteSqlServerQueryAsync(string host, int port, string database, string username, string password, string query)
    {
        var connectionString = $"Server={host},{port};Database={database};User Id={username};Password={password};TrustServerCertificate=True";
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = new SqlCommand(query, connection);
        await using var reader = await command.ExecuteReaderAsync();

        return await DataReaderToJsonAsync(reader);
    }

    #endregion

    #region MongoDB

    private async Task<bool> TestMongoDbConnectionAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = string.IsNullOrEmpty(username)
            ? $"mongodb://{host}:{port}"
            : $"mongodb://{username}:{password}@{host}:{port}";

        var client = new MongoClient(connectionString);
        var db = client.GetDatabase(database);
        await db.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1));
        return true;
    }

    private async Task<string> GetMongoDbSchemaAsync(string host, int port, string database, string username, string password)
    {
        var connectionString = string.IsNullOrEmpty(username)
            ? $"mongodb://{host}:{port}"
            : $"mongodb://{username}:{password}@{host}:{port}";

        var client = new MongoClient(connectionString);
        var db = client.GetDatabase(database);

        var schema = new StringBuilder();
        schema.AppendLine("-- MongoDB Database Schema (Sample Documents)");
        schema.AppendLine();

        var collections = await db.ListCollectionNamesAsync();
        var collectionList = await collections.ToListAsync();

        foreach (var collectionName in collectionList)
        {
            schema.AppendLine($"-- Collection: {collectionName}");

            var collection = db.GetCollection<BsonDocument>(collectionName);
            var sampleDoc = await collection.Find(new BsonDocument()).FirstOrDefaultAsync();

            if (sampleDoc != null)
            {
                schema.AppendLine("Sample document structure:");
                schema.AppendLine(sampleDoc.ToJson(new MongoDB.Bson.IO.JsonWriterSettings { Indent = true }));
            }
            else
            {
                schema.AppendLine("(empty collection)");
            }
            schema.AppendLine();
        }

        return schema.ToString();
    }

    private async Task<string> ExecuteMongoDbQueryAsync(string host, int port, string database, string username, string password, string query)
    {
        var connectionString = string.IsNullOrEmpty(username)
            ? $"mongodb://{host}:{port}"
            : $"mongodb://{username}:{password}@{host}:{port}";

        var client = new MongoClient(connectionString);
        var db = client.GetDatabase(database);

        // Parse the query (expected format: collectionName.find({...}) or similar)
        // For simplicity, we'll use RunCommandAsync
        var command = BsonDocument.Parse(query);
        var result = await db.RunCommandAsync<BsonDocument>(command);

        return result.ToJson();
    }

    #endregion

    #region Helpers

    private async Task<string> DataReaderToJsonAsync(IDataReader reader)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var columns = new List<string>();
        var rows = new List<Dictionary<string, object?>>();

        // Get column names
        for (int i = 0; i < reader.FieldCount; i++)
        {
            columns.Add(reader.GetName(i));
        }

        // Get rows
        while (await Task.Run(() => reader.Read()))
        {
            var row = new Dictionary<string, object?>();
            for (int i = 0; i < reader.FieldCount; i++)
            {
                var value = reader.GetValue(i);
                row[reader.GetName(i)] = value == DBNull.Value ? null : value;
            }
            rows.Add(row);
        }

        stopwatch.Stop();

        var result = new
        {
            columns,
            rows,
            rowCount = rows.Count,
            executionTimeMs = (int)stopwatch.ElapsedMilliseconds
        };

        return JsonSerializer.Serialize(result, new JsonSerializerOptions
        {
            WriteIndented = false,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }

    #endregion
}
