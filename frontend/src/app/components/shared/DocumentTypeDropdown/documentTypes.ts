import { DocumentType } from "../../../models/user.model";

export const DocumentTypes = [
  {
    value: DocumentType.PASSPORT,
    label: "Passport",
  },
  {
    value: DocumentType.ID_CARD,
    label: "ID card",
  },
  {
    value: DocumentType.DRIVERS_LICENSE,
    label: "Driver's license",
  },
  // {
  //   value: DocumentType.ONLINE_BANKING,
  //   label: "Online banking",
  // },
  // {
  //   value: DocumentType.DIGITAL_GOVERNMENT_ID,
  //   label: "Digital government ID",
  // },
];
