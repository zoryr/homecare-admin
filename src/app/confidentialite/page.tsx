import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité · Info Care',
  description:
    "Données personnelles traitées par l'application Info Care de Home & Care : nature, finalités, durées de conservation et droits des salariés.",
};

const MAJ = '3 octobre 2026';

/**
 * Page publique, hors espace admin : son URL est déclarée sur l'App Store et le
 * Play Store, qui exigent une politique de confidentialité accessible sans
 * compte. Le middleware ne protège que /admin.
 */
export default function ConfidentialitePage() {
  return (
    <main className="brand-surface min-h-screen px-6 py-16">
      <article className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-600">Info Care</p>
        <h1 className="mt-2 font-display text-4xl font-medium text-ink-900">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-ink-500">Dernière mise à jour : {MAJ}</p>

        <Section titre="1. Qui traite vos données">
          <p>
            L&apos;application mobile <strong>Info Care</strong> est éditée par <strong>Home &amp; Care</strong>,
            service d&apos;aide à domicile situé 251 chemin des Gourettes, 06370 Mouans-Sartoux.
          </p>
          <p>
            Contact pour toute question sur vos données : <a href="mailto:agence06@homeandcare.fr">agence06@homeandcare.fr</a>{' '}
            ou 09 82 61 10 60.
          </p>
        </Section>

        <Section titre="2. À qui s'adresse l'application">
          <p>
            Info Care est réservée aux salariés de Home &amp; Care. Elle donne accès aux actualités de
            l&apos;agence, aux documents internes, aux informations réglementaires, aux avantages
            salariés, aux sondages internes et aux horaires de l&apos;agence. La connexion se fait avec
            un matricule et un mot de passe remis par l&apos;agence. Aucune inscription libre
            n&apos;est possible.
          </p>
        </Section>

        <Section titre="3. Données traitées">
          <Table
            entetes={['Données', 'Pourquoi']}
            lignes={[
              [
                'Matricule, nom, prénom, adresse e-mail interne, rôle, statut actif ou inactif',
                'Vous identifier et vous donner accès aux contenus réservés aux salariés',
              ],
              [
                'Mot de passe, conservé sous forme chiffrée et jamais lisible par l’agence',
                'Sécuriser la connexion',
              ],
              [
                'Date à laquelle la vidéo de présentation a été vue',
                'Ne pas vous la rejouer à chaque connexion',
              ],
              [
                'Jeton de notification, type d’appareil (iPhone ou Android) et nom de l’appareil',
                'Envoyer les notifications de l’agence sur votre téléphone',
              ],
              [
                'État d’envoi, de lecture et d’ouverture des notifications',
                'Savoir si une information importante a bien été reçue',
              ],
              [
                'Participation aux sondages : qui a répondu et quand',
                'Éviter les doubles réponses et relancer ceux qui n’ont pas répondu',
              ],
              [
                'Réponses aux sondages',
                'Enregistrées séparément de la participation, avec un identifiant aléatoire. L’agence voit les réponses, sans pouvoir les relier à une personne',
              ],
            ]}
          />
          <p>
            L&apos;application ne demande ni votre position, ni l&apos;accès à vos photos, à vos
            contacts, à votre micro ou à votre caméra. La seule autorisation demandée est celle des
            notifications, que vous pouvez refuser ou retirer à tout moment dans les réglages de
            votre téléphone.
          </p>
        </Section>

        <Section titre="4. Sur quelle base légale">
          <p>
            Ces traitements reposent sur l&apos;exécution du contrat de travail et sur l&apos;intérêt
            légitime de l&apos;employeur à informer son personnel. Les notifications reposent sur
            votre accord, donné lors de la demande d&apos;autorisation du téléphone.
          </p>
        </Section>

        <Section titre="5. Qui a accès à vos données">
          <p>
            Seules la direction et les personnes habilitées de Home &amp; Care consultent ces
            données, dans l&apos;espace d&apos;administration. Elles ne sont ni vendues, ni louées, ni
            utilisées à des fins publicitaires.
          </p>
          <p>Les prestataires techniques suivants interviennent pour notre compte :</p>
          <ul>
            <li>
              <strong>Supabase</strong> : hébergement de la base de données et des fichiers.
            </li>
            <li>
              <strong>Vercel</strong> : hébergement de l&apos;espace d&apos;administration.
            </li>
            <li>
              <strong>Expo</strong> : service d&apos;envoi des notifications.
            </li>
            <li>
              <strong>Apple</strong> et <strong>Google</strong> : acheminement des notifications
              jusqu&apos;à votre téléphone.
            </li>
          </ul>
          <p>
            Certains de ces prestataires sont établis aux États-Unis. Les transferts de données hors
            de l&apos;Union européenne sont encadrés par les clauses contractuelles types de la
            Commission européenne.
          </p>
        </Section>

        <Section titre="6. Combien de temps elles sont conservées">
          <ul>
            <li>Compte salarié : pendant la durée du contrat de travail, puis supprimé sous 3 mois.</li>
            <li>
              Jeton de notification : désactivé dès la déconnexion, supprimé après 12 mois sans
              utilisation.
            </li>
            <li>Suivi des notifications : 12 mois.</li>
            <li>
              Réponses aux sondages : conservées sans lien avec votre compte, pour les statistiques
              internes.
            </li>
          </ul>
        </Section>

        <Section titre="7. Vos droits">
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
            limitation, d&apos;opposition et de portabilité sur vos données. Pour les exercer,
            écrivez à <a href="mailto:agence06@homeandcare.fr">agence06@homeandcare.fr</a> ou
            adressez-vous directement à l&apos;agence.
          </p>
          <p>
            Si une réponse ne vous convient pas, vous pouvez saisir la CNIL, 3 place de Fontenoy,
            TSA 80715, 75334 Paris Cedex 07, ou sur <a href="https://www.cnil.fr">www.cnil.fr</a>.
          </p>
        </Section>

        <Section titre="8. Sécurité">
          <p>
            Les échanges entre l&apos;application et nos serveurs sont chiffrés. Chaque salarié
            n&apos;accède qu&apos;à ses propres données personnelles : des règles de sécurité
            appliquées côté serveur empêchent l&apos;accès aux informations des autres salariés. La
            session est conservée sur le téléphone dans un espace sécurisé, et se ferme à la
            déconnexion.
          </p>
        </Section>

        <Section titre="9. Modifications">
          <p>
            Cette politique peut évoluer avec l&apos;application. La date de dernière mise à jour
            figure en haut de cette page.
          </p>
        </Section>

        <footer className="mt-12 border-t border-ink-200 pt-6 text-sm text-ink-500">
          Home &amp; Care · Pays de Grasse ·{' '}
          <a href="https://www.homeandcare.fr">www.homeandcare.fr</a>
        </footer>
      </article>
    </main>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-medium text-ink-900">{titre}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-700 [&_a]:text-brand-600 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function Table({ entetes, lignes }: { entetes: string[]; lignes: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr>
            {entetes.map((e) => (
              <th key={e} className="border-b border-ink-200 py-2 pr-4 font-medium text-ink-900">
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l[0]}>
              {l.map((c) => (
                <td key={c} className="border-b border-ink-100 py-2 pr-4 align-top text-ink-700">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
