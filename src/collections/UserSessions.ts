import { CollectionConfig } from 'payload/types'

const UserSessions: CollectionConfig = {
    slug: 'user_sessions',
    labels: {
        singular: 'User sessions',
        plural: 'Users sessions'
    },
    fields: [
        {
            name: "sid",
            label: "sid",
            type: "text",
            unique: true,
            required: true
        },
        {
            name: "sess",
            label: "sess",
            type: "json",
            required: true,
        },
        {
            name: "expire",
            label: "expire",
            type: "date",
            required: true,
        }


    ],
}

export default UserSessions
