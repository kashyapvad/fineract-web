import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforms snake_case relationship names to user-friendly display names
 */
@Pipe({
  name: 'relationshipDisplay'
})
export class RelationshipDisplayPipe implements PipeTransform {
  transform(relationshipType: string): string {
    if (!relationshipType) {
      return '–';
    }

    const displayMap: { [key: string]: string } = {
      parent: 'Parent',
      sibling: 'Sibling',
      spouse: 'Spouse',
      business_associate: 'Business Associate',
      other: 'Other'
    };

    return displayMap[relationshipType.toLowerCase()] || this.capitalizeWords(relationshipType);
  }

  private capitalizeWords(text: string): string {
    return text.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
