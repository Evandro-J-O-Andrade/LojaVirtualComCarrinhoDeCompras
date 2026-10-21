import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import readline from 'node:readline'

const EXPECTED_ADMIN_UUID = '3bf1c769-f4ca-45fe-b52b-ded4de18abc9'
const BUCKET = 'product-images'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  const email = await prompt('Admin email: ')
  const password = await prompt('Admin password: ')

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  })

  if (authError || !authData.user) {
    console.error('Auth failed:', authError?.message)
    process.exit(1)
  }

  if (authData.user.id !== EXPECTED_ADMIN_UUID) {
    console.error('UUID mismatch. Expected:', EXPECTED_ADMIN_UUID, 'Got:', authData.user.id)
    await supabase.auth.signOut()
    process.exit(1)
  }

  console.log('Authenticated as admin:', authData.user.email, authData.user.id)

  const filePath = await prompt('Image file path: ')
  const resolvedPath = resolve(filePath.trim())
  const fileBuffer = readFileSync(resolvedPath)
  const fileName = resolvedPath.split(/[\\/]/).pop()
  const objectPath = `pilot/${fileName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, fileBuffer, { upsert: false })

  if (uploadError) {
    console.error('Upload failed:', uploadError.message)
    await supabase.auth.signOut()
    process.exit(1)
  }

  console.log('Uploaded:', uploadData.path)

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  console.log('Public URL:', urlData.publicUrl)

  const res = await fetch(urlData.publicUrl)
  console.log('HTTP status:', res.status, res.statusText)

  await supabase.auth.signOut()
  console.log('Done. Session signed out.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
