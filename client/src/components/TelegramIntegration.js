import React from 'react';
import { ExternalLink, MessageCircle, Bell, TrendingUp } from 'lucide-react';
import Button from './UI/Button';
import Card from './UI/Card';

const TelegramIntegration = () => {
  const telegramChannelUrl = 'https://t.me/smartalgos_signals'; // Replace with actual channel URL
  const telegramBotUrl = 'https://t.me/smartalgos_bot'; // Replace with actual bot URL

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <MessageCircle className="h-8 w-8" />
            <h2 className="text-3xl font-bold">Get Real-time Trading Signals</h2>
          </div>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join our Telegram community for instant trading signals, market analysis, and AI-powered predictions. 
            Stay ahead of the market with our professional trading insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <div className="p-6 text-center">
                <Bell className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trading Signals</h3>
                <p className="text-blue-100 mb-4">
                  Get instant buy/sell signals with entry, stop-loss, and take-profit levels
                </p>
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => window.open(telegramChannelUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Signal Channel
                </Button>
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <div className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI Analysis Bot</h3>
                <p className="text-blue-100 mb-4">
                  Interactive bot providing market analysis, predictions, and portfolio insights
                </p>
                <Button 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => window.open(telegramBotUrl, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Bot Chat
                </Button>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live signals updated 24/7</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>AI-powered analysis</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Free to join</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramIntegration;
