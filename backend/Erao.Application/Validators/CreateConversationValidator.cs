using FluentValidation;
using Erao.Core.DTOs.Chat;

namespace Erao.Application.Validators;

public class CreateConversationValidator : AbstractValidator<CreateConversationRequest>
{
    public CreateConversationValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(500).WithMessage("Title must not exceed 500 characters");
    }
}
