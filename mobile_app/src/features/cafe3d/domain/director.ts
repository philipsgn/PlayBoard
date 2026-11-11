import type { ActionPlan } from './actionPlan.ts';

export class ActionDirector {
  public static mapEventToActionPlan(
    eventId: string,
    optionId?: 'A' | 'B' | 'C'
  ): ActionPlan | null {
    // 1. Thẻ 01: Chọn Mặt Bằng & Nghi Thức Mở Quán
    if (eventId === 'CH2_CARD_01') {
      return {
        id: 'plan_open_venue',
        skippable: true,
        maxSeconds: 12,
        steps: [
          { do: 'hand_over_money', wait: 1.0, props: ['bills'], bind: 'cash' },
          { do: 'take_key_from_pocket', wait: 0.8, props: ['key'] },
          { do: 'approach_door', at: 'node_cafe_door_exterior', wait: 1.0 },
          { do: 'unlock_door', wait: 0.8, props: ['key'] },
          { do: 'flip_sign_to_open', wait: 0.6 },
          { do: 'push_door_open', wait: 0.8 },
          { do: 'enter_building', at: 'node_cafe_lobby', wait: 0.8 },
          { do: 'start_coffee_machine', at: 'node_cafe_espresso_station', wait: 1.2 },
          { do: 'celebrate_fist_pump', wait: 1.0 },
        ],
      };
    }

    // 2. Thẻ 02: Trang Bị Máy Pha Cà Phê
    if (eventId === 'CH2_CARD_02') {
      if (optionId === 'A') {
        return {
          id: 'plan_machine_new',
          skippable: true,
          maxSeconds: 8,
          steps: [
            { do: 'approach_station', at: 'node_cafe_espresso_station', wait: 1.0 },
            { do: 'start_coffee_machine', wait: 1.2 },
            { do: 'pour_coffee', wait: 1.5, props: ['cup'] },
            { do: 'celebrate_fist_pump', wait: 1.2, bind: 'satisfaction' },
          ],
        };
      }
      return {
        id: 'plan_machine_standard',
        skippable: true,
        maxSeconds: 6,
        steps: [
          { do: 'approach_station', at: 'node_cafe_espresso_station', wait: 1.0 },
          { do: 'start_coffee_machine', wait: 1.2 },
          { do: 'nod_agree', wait: 0.8 },
        ],
      };
    }

    // 3. Khủng Hoảng Reviewer 1 Sao Bốc Phốt
    if (eventId === 'CRISIS_TIKTOK_REVIEWER') {
      if (optionId === 'A') {
        // Cầu thị làm video cảm ơn & mời reviewer
        return {
          id: 'crisis_reviewer_option_a',
          skippable: true,
          maxSeconds: 8,
          steps: [
            { do: 'take_phone_out', at: 'node_cafe_lobby', wait: 0.8, props: ['phone'] },
            { do: 'film_video_selfie', wait: 1.8, props: ['phone'] },
            { do: 'post_video', wait: 1.0, props: ['phone'] },
            { do: 'celebrate_fist_pump', wait: 1.2, bind: 'satisfaction' },
          ],
        };
      } else if (optionId === 'B') {
        // Im lặng chờ bão lắng
        return {
          id: 'crisis_reviewer_option_b',
          skippable: true,
          maxSeconds: 6,
          steps: [
            { do: 'sigh_deep', at: 'node_cafe_espresso_station', wait: 1.5 },
            { do: 'hands_on_head_worry', wait: 1.8, bind: 'cups' },
            { do: 'wipe_table', wait: 1.2, props: ['cloth'] },
          ],
        };
      } else if (optionId === 'C') {
        // Bình luận đôi co dọa kiện
        return {
          id: 'crisis_reviewer_option_c',
          skippable: true,
          maxSeconds: 7,
          steps: [
            { do: 'take_phone_out', at: 'node_cafe_lobby', wait: 0.8, props: ['phone'] },
            { do: 'angry_phone_call', wait: 2.0, props: ['phone'] },
            { do: 'hands_on_head_worry', wait: 1.5, bind: 'satisfaction' },
          ],
        };
      }
    }

    // 4. Sự Cố The Breakdown: Máy Pha Bốc Khói
    if (eventId === 'BREAKDOWN') {
      if (optionId === 'A') {
        return {
          id: 'breakdown_wrench_repair',
          skippable: true,
          maxSeconds: 8,
          steps: [
            { do: 'approach_station', at: 'node_cafe_espresso_station', wait: 1.0 },
            { do: 'repair_wrench', wait: 2.2, props: ['wrench'] },
            { do: 'wipe_table', wait: 1.0, props: ['cloth'] },
            { do: 'celebrate_fist_pump', wait: 1.0 },
          ],
        };
      } else if (optionId === 'B') {
        return {
          id: 'breakdown_buy_new',
          skippable: true,
          maxSeconds: 7,
          steps: [
            { do: 'hand_over_money', wait: 1.0, props: ['bills'], bind: 'cash' },
            { do: 'approach_station', at: 'node_cafe_espresso_station', wait: 1.0 },
            { do: 'start_coffee_machine', wait: 1.5 },
            { do: 'celebrate_fist_pump', wait: 1.2 },
          ],
        };
      }
    }

    return null;
  }
}
