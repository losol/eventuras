using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using losol.EventManagement.Domain;

namespace losol.EventManagement.Services
{
	public interface ICertificatesService
	{
        /// <summary>
		/// Returns a certificate by certificate id.
		/// </summary>
		/// <param name="certificateId">The certificateId for the certificate to get.</param>
		/// <returns>Certificate</returns>
		Task<Certificate> GetAsync(int certificateId);

		/// <summary>
		/// Returns a certificate by registration Id.
		/// </summary>
		/// <param name="certificateId">The certificateId for the certificate to get.</param>
		/// <returns>Certificate</returns>
		Task<Certificate> GetForRegistrationAsync(int registrationId);

		/// <summary>
		/// Creates new certificates for registrants with no existing certificates
		/// and returns the newly created certificates.
		/// </summary>
		/// <param name="eventId">The eventId to create certificates for.</param>
		/// <returns></returns>
		Task<List<Certificate>> CreateNewCertificates(int eventId, string issuedByUsername);

	}
}
