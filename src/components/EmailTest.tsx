import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { EmailService } from '../lib/emailService';
import { getEmailConfig, validateEmailConfig } from '../lib/emailConfig';

const EmailTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testEmailConfiguration = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Get current email configuration
      const config = getEmailConfig();
      
      // Validate configuration
      const errors = validateEmailConfig(config);
      if (errors.length > 0) {
        setTestResult({
          success: false,
          message: 'Configuration errors found:',
          details: errors.join(', ')
        });
        return;
      }

      // Initialize email service
      EmailService.initialize(config);

      // Send test email
      await EmailService.sendWelcomeEmail(
        'test@example.com',
        'test-campaign-id',
        'This is a test PDF content',
        'Test Campaign'
      );

      setTestResult({
        success: true,
        message: 'Email configuration is working!',
        details: `Successfully sent test email using ${config.provider}`
      });

    } catch (error) {
      setTestResult({
        success: false,
        message: 'Email test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getCurrentConfig = () => {
    const config = getEmailConfig();
    return {
      provider: config.provider,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
      hasApiKey: !!config.apiKey,
      hasDomain: !!config.domain
    };
  };

  const currentConfig = getCurrentConfig();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <Mail className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Email Configuration Test</h2>
      </div>

      {/* Current Configuration Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Current Configuration:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Provider:</span>
            <span className="font-medium">{currentConfig.provider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">From Email:</span>
            <span className="font-medium">{currentConfig.fromEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">From Name:</span>
            <span className="font-medium">{currentConfig.fromName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">API Key:</span>
            <span className={`font-medium ${currentConfig.hasApiKey ? 'text-green-600' : 'text-red-600'}`}>
              {currentConfig.hasApiKey ? '✓ Configured' : '✗ Missing'}
            </span>
          </div>
          {currentConfig.provider === 'mailgun' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Domain:</span>
              <span className={`font-medium ${currentConfig.hasDomain ? 'text-green-600' : 'text-red-600'}`}>
                {currentConfig.hasDomain ? '✓ Configured' : '✗ Missing'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Test Button */}
      <button
        onClick={testEmailConfiguration}
        disabled={isTesting}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isTesting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Testing Email Configuration...
          </>
        ) : (
          <>
            <Mail className="h-5 w-5 mr-2" />
            Test Email Configuration
          </>
        )}
      </button>

      {/* Test Results */}
      {testResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            )}
            <div>
              <h4 className={`font-semibold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </h4>
              {testResult.details && (
                <p className={`text-sm mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.details}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Create an account with SendGrid or Mailgun</li>
          <li>Verify your sender email address</li>
          <li>Create an API key</li>
          <li>Update your .env file with the configuration</li>
          <li>Restart your development server</li>
          <li>Click "Test Email Configuration" above</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailTest; 