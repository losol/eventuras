using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IUsersService
	{
		Task<Registration> GetAsync(int id);
        Task<bool> UserExist(string email);
        Task<ApplicationUser> CreateUser(string userName, string email, string phone);
	}
}
