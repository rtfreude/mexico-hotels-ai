import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Intended as a singleton for site-wide copy (footer, title, contact)
  // Prevent creating or deleting this document from the Studio; edit the single document instead
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'siteTitle', title: 'Site Title', type: 'string' }),
    defineField({ name: 'siteDescription', title: 'Site Description', type: 'array', of: [{ type: 'block' }] }),
    defineField({
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Column Title', type: 'string' }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', title: 'Link Text', type: 'string' }),
                    defineField({ name: 'url', title: 'URL / Path', type: 'string' }),
                    defineField({ name: 'external', title: 'Open in new tab', type: 'boolean' })
                  ]
                }
              ]
            })
          ]
        }
      ]
    }),
    defineField({
      name: 'contact',
      title: 'Contact Info',
      type: 'object',
      fields: [
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'supportText', title: 'Support Text', type: 'string' })
      ]
    }),
    defineField({ name: 'copyrightText', title: 'Copyright / Bottom Text', type: 'string' }),
    defineField({ name: 'bottomBody', title: 'Bottom Body (rich text)', type: 'array', of: [{ type: 'block' }] })
  ],
  preview: {
    select: { title: 'siteTitle' }
  }
})
