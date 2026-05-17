import { Resend } from "resend";

const resend = new Resend(process.env.RE_SEND_API_KEY);

export default resend;
