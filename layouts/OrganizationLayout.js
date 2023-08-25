import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'

export default function OrganizationLayout({ children, frontMatter }) {
  const { companyName, avatar, email, twitter, linkedin, website } = frontMatter

  return (
    <>
      <h3 className="text-center text-2xl font-bold tracking-tight">{companyName}</h3>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center pt-8">
            <Image
              src={avatar}
              alt="avatar"
              width="192px"
              height="192px"
              className="h-48 w-48 rounded-full"
            />
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="mail" href={website} />
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="twitter" href={twitter} />
            </div>
          </div>
          <div className="prose max-w-none pt-8 pb-8 dark:prose-dark xl:col-span-2">{children}</div>
        </div>
      </div>
    </>
  )
}
