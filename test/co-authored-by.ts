// deno run --allow-all test/co-authored-by.ts <contacts.json>

type ContactPartial = {
  /** Names */
  2: {
    /** Full name */
    1: string
    /** First name */
    3: string
    /** last name */
    4: string | null
  }[]
  /** Emails */
  9: {
    /** Email address */
    1: string
  }[]
}

const [contactsPath] = Deno.args
const contacts: ContactPartial[] = await Deno.readTextFile(contactsPath).then(
  JSON.parse
)

for (const contact of contacts) {
  console.log(`Co-authored-by: a <${contact[9][0][1]}>`)
}
