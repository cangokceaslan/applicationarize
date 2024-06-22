declare module "applicationarize" {
    interface ApplicationarizeOptions {
        name: string;
        icon: string;
        url: string;
        platform: "windows" | "linux" | "mac";
    }

    function applicationarize(options: ApplicationarizeOptions): void;

    export default applicationarize;
}
