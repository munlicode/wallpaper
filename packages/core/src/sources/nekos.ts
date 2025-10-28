import { ISource, Wallpaper } from '../types.js';
import { NekosAPI } from 'nekosapi';
import { BaseImageOptions } from 'nekosapi/v4/types/baseImageOptions.js';
import { TagNames, Tags } from 'nekosapi/v4/types/Tags.js';

// Create a single, reusable instance of the client
const nekos = new NekosAPI();
const ValidTagsSet = new Set<string>(
  Object.values(Tags).filter(v => typeof v === 'string')
);

export class NekosSource implements ISource {
  public name = 'nekos';

  async getWallpaper(query: string): Promise<Wallpaper> {
    console.log(`NekosSource: Fetching '${query}'`);

    // Use 'query' as the category.
    // If 'random', pass 'undefined' to get a truly random image.
    const category = query === 'random' ? undefined : [query];
    try {
      const inputCategory = category?.[0];
      const options = { rating: ["suggestive", "safe"] } // NOTE: Adjust by need? // TODO: Allow settings this in settings
      let image;
      if (inputCategory && ValidTagsSet.has(inputCategory)) {
        // It's valid!
        // We can safely use a type assertion here because
        // we just verified the string is valid.
        image = await nekos.getRandomImage(inputCategory as TagNames, options as BaseImageOptions);
      } else {
        // It's either 'undefined' or an invalid string.
        // In either case, pass 'undefined' to get a random one.
        image = await nekos.getRandomImage(undefined, options as BaseImageOptions);
      }
      if (!image) {
        throw new Error(`No image found for category: ${query}`);
      }
      const url = (image as any).url;
      const tags = (image as any).tags || [];
      // Map the NekosAPI 'image' object to our internal 'Wallpaper' type
      return {
        id: String(image.id),
        // nekosapi only provides one URL, so we assign it to all fields
        urls: {
          raw: url,
          full: url,
          regular: url,
          small: url,
        },
        source: this.name,
        // The API includes artist info on the image object
        author: image.artist?.name || 'Unknown',
        // The API includes categories on the image object
        tags: tags,
        width: image.image_width,
        height: image.image_height,
      };

    } catch (err) {
      if (err instanceof Error) {
        console.error(`[NekosSource Error] ${err.message}`);
        if (err.message.includes('404')) {
          throw new Error(`Category not found.`);
        }
      } else {
        console.error(`[NekosSource Error] An unknown error occurred:`, err);
      }
      throw new Error('Failed to fetch image from Nekos.land.');
    }
  }
};