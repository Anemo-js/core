/**
 * Return a string of time span. (30 days pre month and 360 days pre year by default)
 *
 * @since 0.1.0
 * @param {number} millisecond The date diff milliseconds.
 * @param {boolean} [isZh=true] The time locale. True is means Chinese, while false refers to English.
 * @returns {string} Return the time diff description.
 * @example
 *
 * oim.formatDateDiff(new Date('2020/02/07 02:07') - new Date('2001/04/07 04:07'));
 *    // => '19年1月9天22时'
 *
 * oim.formatDateDiff(new Date('2020/02/07 02:07', false) - new Date('2001/04/07 04:07'));
 *    // => '19y1mo9d22h'
 */
export declare function formatDateDiff(millisecond: number, isZh?: boolean, full?: boolean): string;
