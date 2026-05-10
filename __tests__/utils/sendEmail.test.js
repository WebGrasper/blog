const nodemailer = require('nodemailer');
const sendEmail = require('../../utils/sendEmail');

describe('sendEmail', () => {
  it('should call nodemailer with correct parameters', async () => {
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail: mockSendMail });

    const options = {
      subject: 'Test',
      recieverEmailID: 'test@example.com',
      otp: 123456
    };

    await sendEmail(options);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
  });
});
