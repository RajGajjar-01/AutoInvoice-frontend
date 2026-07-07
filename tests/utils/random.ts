const randomEmail = () =>
  `test_${Math.random().toString(36).substring(7)}@example.com`
const randomTeamName = () => `Team ${Math.random().toString(36).substring(7)}`
const randomPassword = () => `${Math.random().toString(36).substring(2)}`
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
const randomItemTitle = () => `Item ${Math.random().toString(36).substring(7)}`
const randomItemDescription = () =>
  `Description ${Math.random().toString(36).substring(7)}`

export {
  randomEmail,
  randomItemDescription,
  randomItemTitle,
  randomPassword,
  randomTeamName,
  slugify,
}
