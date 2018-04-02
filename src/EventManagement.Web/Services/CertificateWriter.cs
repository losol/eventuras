using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.NodeServices;

namespace losol.EventManagement.Web.Services
{
	public class CertificateWriter
	{
		private readonly INodeServices _nodeServices;
		public CertificateWriter(INodeServices nodeServices)
		{
			_nodeServices = nodeServices;
		}

		public async Task Write(string content)
		{
			await _nodeServices.InvokeAsync<string>("./writeToPdf");
		}
	}
}
