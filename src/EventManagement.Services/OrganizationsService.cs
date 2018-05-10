
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace losol.EventManagement.Services {
	public class OrganizationService : IOrganizationService {
		private readonly ApplicationDbContext _db;
		private readonly IPaymentMethodService _paymentMethods;
		private readonly ILogger _logger;

		public OrganizationService (
			ApplicationDbContext db, 
			IPaymentMethodService paymentMethods,
			ILogger<RegistrationService> logger) 
		{
			_db = db;
			_paymentMethods = paymentMethods;
			_logger = logger;
		}

		public async Task<Organization> GetAsync(int id){
			return await _db.Organizations
                .Where( m => m.OrganizationId == id)
				.FirstOrDefaultAsync();
		}

		public async Task<int> Add(Organization organization)
        {
			_db.Organizations
                .Add (organization);
            return await _db.SaveChangesAsync();
		}
		public async Task<bool> Update(Organization organization){
			_db.Organizations
                .Update (organization);
            return await _db.SaveChangesAsync() > 0;
		}	

	}
}