import path from 'path'

import { payloadCloud } from '@payloadcms/plugin-cloud'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload/config'

import User from './collections/User'
import GoogleLoginButton from './components/GoogleLoginButton'
import UserSessions from './collections/UserSessions'

export default buildConfig({
  admin: {
    user: User.slug,
    bundler: webpackBundler(),
    components: {
      afterLogin: [
        GoogleLoginButton
      ]
    }
  },
  editor: lexicalEditor({}),
  collections: [User, UserSessions],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [payloadCloud()],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
})
