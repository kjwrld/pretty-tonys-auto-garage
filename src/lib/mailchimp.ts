interface MailChimpSubscribeData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function subscribeToMailChimp(data: MailChimpSubscribeData) {
  try {
    const response = await fetch('/api/mailchimp/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to newsletter');
    }

    return await response.json();
  } catch (error) {
    console.error('MailChimp subscription error:', error);
    throw error;
  }
}