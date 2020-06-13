using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Eventuras.Domain;
using Eventuras.Infrastructure;
using Microsoft.EntityFrameworkCore;
using static Eventuras.Domain.Order;

namespace Eventuras.Services
{
    public class MessageLogService : IMessageLogService
    {
        private readonly ApplicationDbContext _db;

        public MessageLogService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<bool> AddAsync(int eventinfoId, string recipients, string messageContent, string messageType, string provider = "", string result = "")
        {
            var entry = new MessageLog()
            {
                EventInfoId = eventinfoId,
                Recipients = recipients,
                MessageContent = messageContent,
                MessageType = messageType,
                Provider = provider,
                Result = result
            };
            _db.MessageLogs.Add(entry);
            return await _db.SaveChangesAsync() > 0;
        }

        public async Task<List<MessageLog>> Get(int eventInfoId)
        {
            return await _db.MessageLogs
                .Where(m => m.EventInfoId == eventInfoId)
                .OrderByDescending(m => m.TimeStamp)
                .ToListAsync();
        }
    }
}