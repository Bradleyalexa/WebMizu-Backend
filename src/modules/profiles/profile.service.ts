import { ProfileRepository } from "./profile.repository";
import { Profile } from "./domain/profile";

export class ProfileService {
  private repo: ProfileRepository;

  constructor() {
    this.repo = new ProfileRepository();
  }

  async getProfile(id: string): Promise<Profile> {
    const profile = await this.repo.findById(id);
    
    if (!profile) {
      // Logic: Profile must exist if auth passed, but if missing in table, it's a data consistency issue
      throw new Error(`Profile not found for ID ${id}`);
    }

    return profile;
  }
}
