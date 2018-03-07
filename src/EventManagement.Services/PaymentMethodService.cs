using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using losol.EventManagement.Domain;
using losol.EventManagement.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace losol.EventManagement.Services
{
	public class PaymentMethodService : IPaymentMethodService
	{
		private readonly ApplicationDbContext _db;

		public PaymentMethodService(ApplicationDbContext db)
		{
			_db = db;
		}

		public Task<List<PaymentMethod>> GetActivePaymentMethodsAsync()
		{
			return _db.PaymentMethods
				      .Where(pm => pm.Active)
				      .AsNoTracking()
				      .ToListAsync();
		}

		public Task<PaymentMethod> GetAsync(int id)
		{
			return _db.PaymentMethods.FindAsync(id);
		}

		public Task<PaymentMethod> GetDefaultPaymentMethod()
		{
			return GetAsync(GetDefaultPaymentMethodId());
		}

		public int GetDefaultPaymentMethodId()
		{
			// HACK: Read this from a config!
			return 2;
		}
	}
}
