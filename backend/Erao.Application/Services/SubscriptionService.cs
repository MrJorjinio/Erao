using Erao.Core.DTOs.Subscription;
using Erao.Core.Enums;
using Erao.Core.Interfaces;

namespace Erao.Application.Services;

public interface ISubscriptionService
{
    Task<IEnumerable<SubscriptionPlanDto>> GetPlansAsync(Guid userId);
    Task<SubscriptionResponse> GetCurrentSubscriptionAsync(Guid userId);
    Task<SubscriptionResponse> UpgradeSubscriptionAsync(Guid userId, SubscriptionTier newTier);
}

public class SubscriptionService : ISubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;

    private static readonly List<SubscriptionPlanDto> _plans = new()
    {
        new SubscriptionPlanDto
        {
            Tier = SubscriptionTier.Starter,
            Name = "Starter",
            Price = 49m,
            Description = "Perfect for trying out Erao",
            QueriesPerMonth = 500,
            DatabaseConnections = 1,
            SupportLevel = "Basic",
            Features = new List<string>
            {
                "500 queries/month",
                "1 database connection",
                "Basic support"
            },
            IsPopular = false
        },
        new SubscriptionPlanDto
        {
            Tier = SubscriptionTier.Professional,
            Name = "Professional",
            Price = 99m,
            Description = "For growing teams",
            QueriesPerMonth = 3000,
            DatabaseConnections = 5,
            SupportLevel = "Priority",
            Features = new List<string>
            {
                "3,000 queries/month",
                "5 database connections",
                "Priority support"
            },
            IsPopular = true
        },
        new SubscriptionPlanDto
        {
            Tier = SubscriptionTier.Enterprise,
            Name = "Enterprise",
            Price = 299m,
            Description = "For large organizations",
            QueriesPerMonth = 15000,
            DatabaseConnections = -1, // Unlimited
            SupportLevel = "24/7 Dedicated",
            Features = new List<string>
            {
                "15,000 queries/month",
                "Unlimited connections",
                "24/7 dedicated support"
            },
            IsPopular = false
        }
    };

    public SubscriptionService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetPlansAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        var currentTier = user?.SubscriptionTier ?? SubscriptionTier.Starter;

        return _plans.Select(p => new SubscriptionPlanDto
        {
            Tier = p.Tier,
            Name = p.Name,
            Price = p.Price,
            Description = p.Description,
            QueriesPerMonth = p.QueriesPerMonth,
            DatabaseConnections = p.DatabaseConnections,
            SupportLevel = p.SupportLevel,
            Features = p.Features,
            IsCurrent = p.Tier == currentTier,
            IsPopular = p.IsPopular
        });
    }

    public async Task<SubscriptionResponse> GetCurrentSubscriptionAsync(Guid userId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        return new SubscriptionResponse
        {
            CurrentTier = user.SubscriptionTier,
            TierName = user.SubscriptionTier.ToString(),
            QueriesPerMonth = user.QueryLimitPerMonth,
            QueriesUsed = user.QueriesUsedThisMonth,
            BillingCycleReset = user.BillingCycleReset
        };
    }

    public async Task<SubscriptionResponse> UpgradeSubscriptionAsync(Guid userId, SubscriptionTier newTier)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Validate upgrade (can only upgrade, not downgrade for now)
        if (newTier <= user.SubscriptionTier)
        {
            throw new InvalidOperationException("Can only upgrade to a higher tier");
        }

        var newPlan = _plans.FirstOrDefault(p => p.Tier == newTier);
        if (newPlan == null)
        {
            throw new InvalidOperationException("Invalid subscription tier");
        }

        user.SubscriptionTier = newTier;
        user.QueryLimitPerMonth = newPlan.QueriesPerMonth;
        // Keep the current billing cycle, just update the limit

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return new SubscriptionResponse
        {
            CurrentTier = user.SubscriptionTier,
            TierName = user.SubscriptionTier.ToString(),
            QueriesPerMonth = user.QueryLimitPerMonth,
            QueriesUsed = user.QueriesUsedThisMonth,
            BillingCycleReset = user.BillingCycleReset
        };
    }
}
