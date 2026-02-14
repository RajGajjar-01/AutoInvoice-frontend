async function findEmail({
  request,
  filter
}) {
  const response = await request.get(`${process.env.MAILCATCHER_HOST}/messages`);
  let emails = await response.json();
  if (filter) {
    emails = emails.filter(filter);
  }
  const email = emails[emails.length - 1];
  if (email) {
    return email;
  }
  return null;
}
function findLastEmail({
  request,
  filter,
  timeout = 5e3
}) {
  const timeoutPromise = new Promise(
    (_, reject) => setTimeout(
      () => reject(new Error("Timeout while trying to get latest email")),
      timeout
    )
  );
  const checkEmails = async () => {
    while (true) {
      const emailData = await findEmail({ request, filter });
      if (emailData) {
        return emailData;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  };
  return Promise.race([timeoutPromise, checkEmails()]);
}
export {
  findLastEmail
};
