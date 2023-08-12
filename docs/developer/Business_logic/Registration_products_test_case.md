
# Test Case: Request to change total products for registration

## Objective
 Verify that when a user (John) requests to change the "wanted quantity" of products, the system correctly updates the order, considering the current and invoiced products.

## Preconditions

John has already placed orders #255 and #256. Both are invoiced, and they cannot be changed. 
The minimum quantity of K1 conference ticket is 1, and minimum daily rates is 2. 

**Order # 255 - Invoiced**
| ItemCode | Product name               | Quantity | Price | Line total |
| -------- | -------------------------- | -------- | ----- | ---------- |
| K1       | Conference ticket (3 days) | 1        | 1000  | 1000       |
| K2-1     | Small dinner               | 1        | 400   | 400        |
| K3       | Daily rate                 | 2        | 200   | 400        |

**Order # 256 - Invoiced**
| ItemCode | Product name               | Quantity | Price | Line total |
| -------- | -------------------------- | -------- | ----- | ---------- |
| K2-1     | Refund of Small dinner     | -1       | 400   | -400       |
| K2-2     | Large dinner               | 1        | 600   | 600        |

### Aggregate order now
  
| ItemCode | Product name | Current Quantity |
| -------- | ------------ | ---------------- |
| K1       | Ticket       | 1                |
| K2-1     | Small dinner | 0                |
| K2-2     | Large dinner | 1                |
| K3       | Daily rate   | 2                |
| K4       | Sightseeing  | 0                |
| K5       | Guided walk  | 0                |

If he wants to change his products, we will be dropping his editable orders, and place the minimum orderlines to correct it to the wanted quantity of products.

## Cases
### Request for sightseeing
As John would love to have a sightseeing instead of dinner, the frontend sends a json of the total products for Johns registration. It might look like: 

```json
{  "registrationId" : 23
	"products":  [  
	{  "productId":  "K1",  "quantity":  1  },  
	{  "productId":  "K2-1",  "quantity":  0  },  
	{  "productId":  "K2-2",  "quantity":  0  },  
	{  "productId":  "K3",  "quantity":  2  },  
	{  "productId":  "K4",  "quantity":  1  },  
	{  "productId":  "K5",  "quantity":  0  }  
	]  
}
```
Since both orders for the registration is invoiced, we will need to make a new order for John. 

**The (first) new order #257** 

| ItemCode | Product name | Quantity | Price | Line total |
 | -------- | ---------------------- | -------- | ----- | ---------- | 
 | K2-2 | Refund of Large dinner | -1 | 600 | -600 | 
 | K4 | Sightseeing | 1 | 300 | 300 |

## John never decides... 

Before order 257 is invoiced, John redecides. He want a Guided walk instead of sightseeing. Since order 257 is not invoiced, we could just update it. 
 
The frontend request might be like this: 
```json
{  "registrationId" : 23
	"products":  [  
	{  "productId":  "K1",  "quantity":  1  },  
	{  "productId":  "K2-1",  "quantity":  0  },  
	{  "productId":  "K2-2",  "quantity":  0  },  
	{  "productId":  "K3",  "quantity":  2  },  
	{  "productId":  "K4",  "quantity":  0  },  
	{  "productId":  "K5",  "quantity":  1  }  
	]  
}
```

and then the system should just change order 257 to this: 

**The (second) new order #257** 

| ItemCode | Product name | Quantity | Price | Line total |
 | -------- | ---------------------- | -------- | ----- | ---------- | 
 | K2-2 | Refund of Large dinner | -1 | 600 | -600 | 
 | K5 | Guided walk | 1 | 350 | 300 |

## No more coffee for John
John thinks the coffee is to expensive, so he tries to cancel the daily rates (which is including coffee.). As the validation on the front end did not catch it, the backend receives this: 

```json
{  "registrationId" : 23
	"products":  [  
	{  "productId":  "K1",  "quantity":  1  },  
	{  "productId":  "K2-1",  "quantity":  0  },  
	{  "productId":  "K2-2",  "quantity":  0  },  
	{  "productId":  "K3",  "quantity":  0  },  
	{  "productId":  "K4",  "quantity":  0  },  
	{  "productId":  "K5",  "quantity":  1  }  
	]  
}
```

However, since K3 is a mandatory product with a minimum of 2, it should be rejected. But the sum of all orders belonging to his registration has to aggregated to ensure that the sum quantity will be less than the minimum before rejecting. 
