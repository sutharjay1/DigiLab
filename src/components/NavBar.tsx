import Link from "next/link";
// import MaxWidthWrapper from "./MaxWidthWrapper";
// import { Icons } from "./Icons";
// import NavItems from "./NavItems";
import { buttonVariants } from "./ui/button";
// import Cart from "./Cart";
import { cookies } from "next/headers";
import MaxWidthWrapper from "./MaxWithWrapper";
import { ModeToggle } from "./ToggleTheme";
import { Icons } from "./Icons";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import Cart from "./Cart";
import { getServerSideUser } from "@/lib/payloadUtils";
import UserAccountNav from "./UserAccountNav";
// import UserAccountNav from "./UserAccountNav";
// import MobileNav from "./MobileNav";

const Navbar = async () => {
  const nextCookies = cookies();
  const { user } = await getServerSideUser(nextCookies);

  return (
    <div className="sticky z-50 top-0 inset-x-0 h-16 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/75  backdrop-blur-lg transition-all">
      <header className="relative ">
        <MaxWidthWrapper>
          <div className="flex h-16 items-center">
            {/* <MobileNav /> */}

            <div className="ml-2   flex lg:ml-0">
              <Link href="/">
                {/* <Icons.Logo className="h-10 w-10" /> */}
                <span className=" inline-block text-zinc-900 dark:text-zinc-100 text-2xl  lg:text-3xl font-bold">
                  DigiLab.
                </span>
              </Link>
            </div>

            <div className="hidden z-50 lg:ml-8 lg:block lg:self-stretch">
              <NavItems />
            </div>

            <div className="ml-auto flex items-center">
              <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                {user ? null : (
                  <Link
                    href="/sign-in"
                    className={buttonVariants({
                      variant: "ghost",
                    })}
                  >
                    Sign in
                  </Link>
                )}

                {user ? null : (
                  <span className="h-6 w-px bg-zinc-200" aria-hidden="true" />
                )}

                {user ? (
                  <UserAccountNav user={user} />
                ) : (
                  <Link
                    href="/sign-up"
                    className={buttonVariants({
                      variant: "ghost",
                    })}
                  >
                    Create account
                  </Link>
                )}

                {user ? (
                  <span className="h-6 w-px bg-zinc-200" aria-hidden="true" />
                ) : null}

                {user ? null : (
                  <div className="flex lg:ml-6">
                    <span className="h-6 w-px bg-zinc-200" aria-hidden="true" />
                  </div>
                )}

                <div className="ml-4 flow-root lg:ml-6">
                  <Cart />
                </div>
              </div>
              <div className="ml-4 mr-2 flow-root lg:ml-6">
                <ModeToggle />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
