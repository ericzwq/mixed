type createArray<l extends number, el, arr extends el[]> = arr["length"] extends l ? arr : createArray<l, el, [el, ...arr]>
const arr: createArray<1, string, []> = ['string']
