using System.Collections.Generic;
using System.Threading.Tasks;
using Eventuras.Domain;

namespace Eventuras.Services;

public interface IMessageLogService
{
    Task<bool> AddAsync(int eventinfoId, string recipients, string content, string messageType, string provider = "", string result = "");
    Task<List<MessageLog>> Get(int eventInfoId);
}
