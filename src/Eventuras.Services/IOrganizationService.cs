using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services
{
    public interface IOrganizationService
    {
        Task<Organization> GetAsync(int id);
        Task<int> Add(Organization organization);
        Task<bool> Update(Organization organization);
    }
}
