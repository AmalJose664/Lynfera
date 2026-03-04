import { IUserSerivce } from "@/interfaces/service/IUserService.js";
import { IWebhookService } from "@/interfaces/service/IWebhookService.js";

class WebhookService implements IWebhookService {
	private userService: IUserSerivce;

	constructor(userSrvice: IUserSerivce) {
		this.userService = userSrvice;
	}

}

export default WebhookService;
