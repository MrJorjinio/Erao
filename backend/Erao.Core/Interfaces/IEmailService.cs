namespace Erao.Core.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetOtpAsync(string email, string otp);
    Task SendWelcomeEmailAsync(string email, string firstName);
}
