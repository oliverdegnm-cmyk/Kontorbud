// Fast afsendernavn for admin-support-beskeder (tråde uden en tilknyttet opgave,
// dvs. messages.task_id IS NULL). Holdt i én fil, så indsættelse og visning altid
// bruger nøjagtig samme streng, uanset hvilken admin der har svaret.
export const SUPPORT_SENDER = "Kontorbud support";
