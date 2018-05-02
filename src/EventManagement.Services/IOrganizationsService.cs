using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface IOrganizationsService
	{
		Task<Registration> GetAsync(int id);
		Task<int> Add(Organization organization);
		Task<bool> Update(Organization organization);	
	}
}
