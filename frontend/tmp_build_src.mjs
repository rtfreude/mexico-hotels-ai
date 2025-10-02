import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.VITE_SANITY_PROJECT_ID || 'xudqyvow';
const dataset = process.env.VITE_SANITY_DATASET || 'production';

const client = sanityClient({ projectId, dataset, apiVersion: '2024-01-01', useCdn: true });
const builder = imageUrlBuilder(client);

async function run(){
  const base = process.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const res = await fetch(`${base}/api/sanity/preview/hotels`);
  const data = await res.json();
  const first = data[0];
  const imgObj = first.images && first.images[0];
  console.log('hotel:', first.name);
  if(!imgObj || !imgObj.asset){
    console.log('no asset');
    return;
  }
  const asset = imgObj.asset._id || imgObj.asset._ref || imgObj.asset.url;
  console.log('asset id/ref/url:', asset);
  try{
    const src = builder.image(asset).width(800).auto('format').url();
    const srcset = [320,480,768,1024,1600].map(w => `${builder.image(asset).width(w).auto('format').url()} ${w}w`).join(', ');
    console.log('img tag:');
    console.log(`<img src="${src}" srcset="${srcset}" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" alt="${(imgObj.alt||first.name).replace(/"/g,'\"')}"/>`);
  }catch(e){
    console.error('builder error', e && e.message ? e.message : e);
  }
}

run();
