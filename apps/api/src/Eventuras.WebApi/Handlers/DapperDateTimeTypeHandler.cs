using System;
using System.Data;
using Dapper;

namespace Eventuras.WebApi.Handlers;

public class DapperDateTimeTypeHandler : SqlMapper.TypeHandler<DateTime>
{
    public override DateTime Parse(object value)
    {
        if (value is DateTime dateTime)
        {
            return dateTime;
        }
        else if (value is NodaTime.Instant i)
        {
            return i.ToDateTimeUtc();
        }
        else if (value is NodaTime.LocalDateTime lt)
        {
            return lt.ToDateTimeUnspecified();
        }
        throw new ArgumentException($"Invalid value of type '{value?.GetType().FullName}' given. DateTime or NodaTime.Instant values are supported.", nameof(value));
    }

    public void SetValue(IDbDataParameter parameter, object value)
        => parameter.Value = value;

    public override void SetValue(IDbDataParameter parameter, DateTime value)
        => parameter.Value = value;
}
