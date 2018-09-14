using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using static losol.EventManagement.Domain.PaymentMethod;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace losol.EventManagement.Services
{
	public class PaymentMethodService : IPaymentMethodService
	{
        private readonly ApplicationDbContext _db;

		public PaymentMethodService(ApplicationDbContext db)
		{
            _db = db;
		}

		public async Task<List<PaymentMethod>> GetActivePaymentMethodsAsync()
		{
			return await _db.PaymentMethods
				.Where(p => p.Active && !p.AdminOnly).ToListAsync();
		}

        public async Task<PaymentMethod> GetAsync(PaymentProvider provider)
		{
			return await _db.PaymentMethods
                .SingleOrDefaultAsync(p => p.Provider == provider);
		}

		public async Task<PaymentMethod> GetDefaultPaymentMethodAsync()
		{
			return await _db.PaymentMethods.SingleAsync(p => p.IsDefault);
		}

        public PaymentProvider GetDefaultPaymentProvider()
        {
            // TODO: Try to use cache to handle this
            return _db.PaymentMethods.Single(p => p.IsDefault).Provider;
        }
    }
}
