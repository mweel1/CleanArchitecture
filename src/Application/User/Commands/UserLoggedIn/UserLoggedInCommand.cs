using CleanArchitecture.Application.Common.Interfaces;
using CleanArchitecture.Application.Common.Models;
using CleanArchitecture.Application.Common.Security;
using CQRSBridge.Attribute;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CleanArchitecture.Application.User.Commands.UserLoggedIn;


[CommandName("User~UserLoggedIn")]
[Authorize]
public class UserLoggedInCommand : IRequest<Result<EmptyDto>>
{
    public string email { get; set; }
    public bool email_verified { get; set; }
    public string given_name { get; set; }
    public string family_name { get; set; }
    public string picture { get; set; }
    public string sub { get; set; }

}

public class UserLoggedInCommandHandler : IRequestHandler<UserLoggedInCommand, Result<EmptyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    public UserLoggedInCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<EmptyDto>> Handle(UserLoggedInCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.User.Where(w => w.Id == _currentUserService.UserId).FirstOrDefaultAsync(cancellationToken);

        if (user == null)
        {
            _context.User.Add(new Domain.Entities.User()
            {
                FirstName = request.given_name,
                LastName = request.family_name,
                Picture = request.picture,
                Id = _currentUserService.UserId
            });
        }
        else
        {
            user.FirstName = request.given_name;
            user.LastName = request.family_name;
            user.Picture = request.picture;
            user.Id = _currentUserService.UserId;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<EmptyDto>.Success(new EmptyDto());
    }

}
