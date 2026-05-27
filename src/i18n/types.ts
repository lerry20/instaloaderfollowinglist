export type Locale = 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt'

export const LOCALES: Locale[] = ['en', 'it', 'es', 'fr', 'de', 'pt']

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
}

export const LOCALE_FLAG: Record<Locale, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  pt: '🇵🇹',
}

/** The full set of translation keys. English is the source of truth — any
 * key absent from another locale falls back to English at runtime. */
export type DictKey =
  // Navigation
  | 'nav.train' | 'nav.routines' | 'nav.daily' | 'nav.progress' | 'nav.settings'
  // Common buttons
  | 'common.save' | 'common.cancel' | 'common.close' | 'common.delete'
  | 'common.edit' | 'common.add' | 'common.start' | 'common.finish'
  | 'common.discard' | 'common.continue' | 'common.back' | 'common.skip'
  | 'common.activate' | 'common.preview' | 'common.clone' | 'common.optional'
  | 'common.loading' | 'common.starting'
  | 'common.yes' | 'common.no' | 'common.confirm'
  // Common units / labels
  | 'unit.kg' | 'unit.lb' | 'unit.set' | 'unit.sets' | 'unit.reps' | 'unit.rpe'
  | 'unit.weight' | 'unit.bodyweight' | 'unit.warmup' | 'unit.workout'
  // Train start screen
  | 'train.todays_workout' | 'train.no_workout_queued' | 'train.start_workout'
  | 'train.pick_routine_title' | 'train.browse_routines'
  | 'train.what_youll_do' | 'train.n_exercises'
  | 'train.bodyweight' | 'train.routine' | 'train.change' | 'train.log_it'
  | 'train.no_routine_selected'
  | 'train.day_of_cycle' | 'train.more_count'
  | 'workout.day_label' | 'workout.day_fallback' | 'workout.day_name_label' | 'workout.day_name_placeholder'
  | 'workout.empty_cta_title' | 'workout.empty_cta_sub' | 'workout.empty_readonly'
  | 'workout.add_more' | 'workout.picker_add_to'
  | 'workout.field_sets' | 'workout.field_reps' | 'workout.field_rpe'
  // Active session
  | 'session.exercise_of' | 'session.set_of' | 'session.target'
  | 'session.last' | 'session.add_warmup' | 'session.swap_exercise'
  | 'session.watch_demo' | 'session.skip_exercise' | 'session.skip_confirm'
  | 'session.repeat_last' | 'session.more_sets_to_go'
  | 'session.all_sets_done' | 'session.form_cues' | 'session.hide_cues'
  | 'session.swap_to' | 'session.browse_all_exercises' | 'session.discard'
  | 'session.discard_confirm' | 'session.finish_workout'
  | 'session.finish_early' | 'session.finish_anyway' | 'session.keep_going'
  | 'session.sets_left' | 'session.working_sets'
  | 'session.plates' | 'session.tap_to_edit'
  | 'session.log_set' | 'session.add_rpe'
  | 'session.no_history' | 'session.exercise_skipped'
  | 'session.exercise_swapped' | 'session.set_updated' | 'session.set_deleted'
  | 'session.warmup_logged' | 'session.warmup_removed'
  | 'session.warmup_prompt_title' | 'session.warmup_prompt_sub'
  | 'session.warmup_prompt_add' | 'session.warmup_prompt_added'
  // Toasts
  | 'toast.workout_discarded' | 'toast.could_not_start'
  | 'toast.new_pr'
  // Settings
  | 'settings.title' | 'settings.language' | 'settings.units' | 'settings.theme'
  | 'settings.theme_system' | 'settings.theme_light' | 'settings.theme_dark'
  | 'settings.skill_level' | 'settings.skill_beginner' | 'settings.skill_advanced'
  | 'settings.goal' | 'settings.goal_bulk' | 'settings.goal_cut' | 'settings.goal_recomp'
  | 'settings.default_rest' | 'settings.api_key' | 'settings.api_key_hint'
  | 'settings.export_data' | 'settings.reset_data' | 'settings.reset_confirm'
  | 'settings.advanced' | 'settings.about' | 'settings.credits'
  | 'settings.exercises_in_english_note'
  // Onboarding
  | 'onboarding.welcome_title' | 'onboarding.welcome_sub'
  | 'onboarding.choose_language' | 'onboarding.choose_goal'
  | 'onboarding.choose_skill' | 'onboarding.choose_routine'
  | 'onboarding.next' | 'onboarding.get_started'
  // Errors
  | 'error.crashed' | 'error.abandon_sessions' | 'error.just_reload'
  | 'error.reset_all' | 'error.copy_report'
  // Routines + active-routine block
  | 'active-routine.week' | 'active-routine.switch'
  | 'routines.your_program' | 'routines.all_programs' | 'routines.recommended'
  | 'routines.recommended_intro' | 'routines.preview' | 'routines.use_template'
  | 'routines.level_beginner' | 'routines.level_intermediate' | 'routines.level_advanced'
  | 'routines.days_per_week' | 'routines.min_per_session'
  | 'routines.weekly_volume' | 'routines.why_it_works' | 'routines.who_shouldnt'
  | 'routines.activate_this' | 'routines.find_program' | 'routines.start_picker'
  | 'routines.new_program' | 'routines.new_name_placeholder'
  | 'routines.how_many_days' | 'routines.start_from'
  | 'routines.start_template' | 'routines.start_closest' | 'routines.start_empty'
  | 'routines.create'
  // Monthly summary on Progress
  | 'monthly.title' | 'monthly.sessions' | 'monthly.working_sets'
  | 'monthly.prs' | 'monthly.pr_singular' | 'monthly.bw_label' | 'monthly.bw_unit_suffix'
  // Achievements grid
  | 'ach.title' | 'ach.earned'
  | 'ach.first_workout' | 'ach.first_workout_d'
  | 'ach.10_sessions' | 'ach.10_sessions_d'
  | 'ach.50_sessions' | 'ach.50_sessions_d'
  | 'ach.100_sessions' | 'ach.100_sessions_d'
  | 'ach.first_pr' | 'ach.first_pr_d'
  | 'ach.ten_prs' | 'ach.ten_prs_d'
  | 'ach.7_streak' | 'ach.7_streak_d'
  | 'ach.30_streak' | 'ach.30_streak_d'
  | 'ach.20_days' | 'ach.20_days_d'
  // Quick time-budget pills
  | 'budget.full' | 'budget.adherence_hint'
  | 'budget.trimmed_one' | 'budget.trimmed_other'
  | 'budget.quick_tag'

export type Dict = Record<DictKey, string>
