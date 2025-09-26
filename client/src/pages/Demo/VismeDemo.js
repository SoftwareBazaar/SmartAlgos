import React from 'react';

const VismeDemo = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Visme Form Demo
          </h1>
          <p className="text-gray-600">
            This is a demo of the Visme embedded form you provided
          </p>
        </div>

        {/* Visme Form Embed */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="visme_d" 
            data-title="Webinar Registration Form" 
            data-url="g7ddqxx0-untitled-project?fullPage=true" 
            data-domain="forms" 
            data-full-page="true" 
            data-min-height="100vh" 
            data-form-id="133190"
            style={{ minHeight: '600px' }}
          >
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Loading Visme Form...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Load Visme Script */}
      <script 
        src="https://static-bundles.visme.co/forms/vismeforms-embed.js"
        async
      ></script>
    </div>
  );
};

export default VismeDemo;
