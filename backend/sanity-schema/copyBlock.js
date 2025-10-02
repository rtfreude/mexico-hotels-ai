import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'copyBlock',
  title: 'Copy Block',
  type: 'document',
  fields: [
    defineField({ name: 'key', title: 'Key', type: 'string', description: 'Unique key to reference this block in code' }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] })
  ],
  preview: {
    select: { title: 'title', subtitle: 'key' },
    prepare(selection) {
      const {title, subtitle} = selection;
      return {
        title: title || 'Copy Block',
        subtitle: subtitle ? `key: ${subtitle}` : 'key: (missing)'
      }
    }
  }
})
