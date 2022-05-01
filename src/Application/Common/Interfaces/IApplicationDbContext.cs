using CleanArchitecture.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Domain.Entities.User> User{ get; }

    

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
