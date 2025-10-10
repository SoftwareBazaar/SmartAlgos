//+------------------------------------------------------------------+
//|                                           SimpleScalperEA.mq4    |
//|                                    Copyright 2025, Smart Algos   |
//|                                             https://smartalgos.com|
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, Smart Algos"
#property link      "https://smartalgos.com"
#property version   "1.00"
#property strict

//--- Input parameters
input double LotSize = 0.01;           // Lot size
input int    StopLoss = 50;            // Stop Loss in points
input int    TakeProfit = 30;          // Take Profit in points
input int    MagicNumber = 12345;      // Magic Number
input double MaxSpread = 3.0;          // Maximum spread in points

//--- Global variables
double Ask, Bid;
double Spread;
int Ticket;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("Simple Scalper EA Started - Demo Version");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   Print("Simple Scalper EA Stopped");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Get current prices
   Ask = MarketInfo(Symbol(), MODE_ASK);
   Bid = MarketInfo(Symbol(), MODE_BID);
   Spread = (Ask - Bid) / Point;
   
   // Check spread
   if(Spread > MaxSpread)
   {
      Print("Spread too high: ", Spread, " points");
      return;
   }
   
   // Simple scalping logic - Buy when price breaks above MA
   if(OrdersTotal() == 0)
   {
      if(Bid > iMA(Symbol(), 0, 20, 0, MODE_SMA, PRICE_CLOSE, 0))
      {
         Ticket = OrderSend(Symbol(), OP_BUY, LotSize, Ask, 3, 
                          Ask - StopLoss * Point, Ask + TakeProfit * Point, 
                          "Scalper Demo", MagicNumber, 0, clrBlue);
         
         if(Ticket > 0)
            Print("Buy order opened: ", Ticket);
      }
   }
}

//+------------------------------------------------------------------+
//| Trade transaction function                                       |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                       const MqlTradeRequest& request,
                       const MqlTradeResult& result)
{
   if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
   {
      Print("Trade closed with profit: ", trans.profit);
   }
}
