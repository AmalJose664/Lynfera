import { IUser } from "@/models/User.js";

interface UserResponseDTO {
	name: string;
	profileImage: string;
	_id: string;
	plan: string;
}
interface UserResponseDetailedDTO {
	name: string;
	profileImage: string;
	email: string;
	projects: number;
	bandwidthMonthly: number;
	deploymentsToday: number;
	plan: string;
	createdAt: Date;
	_id: string;
	connectedAccounts: string[];
}
export class UserMapper {
	static toUserResponse(user: IUser): { user: UserResponseDTO } {
		return {
			user: {
				_id: user._id.toString(),
				name: user.name,
				profileImage: user.profileImage,
				plan: user.plan,
			},
		};
	}
	static toUserDetailedResponse(data: { user: IUser; bandwidth: number }): { user: UserResponseDetailedDTO } {
		const { user } = data;
		const currentDate = new Date().toISOString().slice(0, 10);
		return {
			user: {
				_id: user._id.toString(),
				name: user.name,
				profileImage: user.profileImage,
				email: user.email,
				projects: Number(user.projects),
				deploymentsToday: Number(user.currentDate === currentDate ? user.deploymentsToday : 0),
				plan: user.plan,
				createdAt: user.createdAt,
				bandwidthMonthly: data.bandwidth,
				connectedAccounts: user.authProviders.map((p) => p.provider),
			},
		};
	}
}
