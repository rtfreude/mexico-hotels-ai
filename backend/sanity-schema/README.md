How to use this schema in Sanity Studio

1. In your Sanity Studio project, create a folder `schemas` if not present.
2. Copy `hotel.js` into that folder (or import it from this repo).
3. Edit `schema.js` (the root of your Studio schemas) and import and add the hotel schema, e.g.:

```javascript
import createSchema from 'part:@sanity/base/schema-creator'
import schemaTypes from 'all:part:@sanity/base/schema-type'
import hotel from './hotel'

export default createSchema({
  name: 'default',
  types: schemaTypes.concat([hotel])
})
```

4. Deploy or run your Sanity Studio locally.
5. Add CORS origin for your backend URL if you plan to fetch from the browser.
6. Create or edit hotel documents in Studio and then seed/reindex via backend endpoints as needed.
