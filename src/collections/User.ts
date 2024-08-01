import { CollectionConfig } from 'payload/types'

const User: CollectionConfig = {
  slug: 'user',
  labels: {
    singular: 'User',
    plural: 'Users'
  },
  auth: {
    cookies: {
      secure: false,
      sameSite: 'none',
    }
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: "sub",
      label: "sub",
      type: "text",
      admin: { readOnly: true },
      access: { update: () => false },
    },
    {
      name: "pictureURL",
      label: "pictureURL",
      type: "text",
      admin: { readOnly: true },
      access: { update: () => false },
    }


  ],
}

export default User
