/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Fun } from '@ephox/katamari';
import { registerMode, setMode } from '../mode/Mode';
import Editor from './Editor';
import { isReadOnly, registerReadOnlyContentFilters, registerReadOnlySelectionBlockers } from '../mode/Readonly';

/**
 * TinyMCE 5 Mode API.
 *
 * @class tinymce.EditorMode
 */

export interface EditorMode {
  /**
   * @method isReadOnly
   * @return {Boolean} true if the editor is in a readonly state.
   */
  isReadOnly: () => boolean;

  /**
   * Sets the editor mode. The available modes are "design" and "readonly". Additional modes can be registered using 'register'.
   *
   * @method set
   * @param {String} mode Mode to set the editor in.
   */
  set: (mode: string) => void;

  /**
   * @method get
   * @return {String} The active editor mode.
   */
  get: () => string;

  /**
   * Registers a new editor mode.
   *
   * @method register
   * @param {EditorModeApi} api Activation and Deactivation API for the new mode.
   */
  register: (mode: string, api: EditorModeApi) => void;
}

export interface EditorModeApi {
  /**
   * Handler to activate this mode, called before deactivating the previous mode.
   *
   * @method activate
   */
  activate: () => void;

  /**
   * Handler to deactivate this mode, called after activating the new mode.
   *
   * @method deactivate
   */
  deactivate: () => void;

  /**
   * Flags whether the editor should be made readonly while this mode is active.
   *
   * @property editorReadOnly
   * @type boolean
   */
  editorReadOnly: boolean;
}

export const create = (editor: Editor): EditorMode => {
  const activeMode = Cell('design');
  const availableModes = Cell<Record<string, EditorModeApi>>({
    design: {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: false
    },
    readonly: {
      activate: Fun.noop,
      deactivate: Fun.noop,
      editorReadOnly: true
    }
  });

  registerReadOnlyContentFilters(editor);
  registerReadOnlySelectionBlockers(editor);

  return {
    isReadOnly: () => isReadOnly(editor),
    set: (mode: string) => setMode(editor, availableModes.get(), activeMode, mode),
    get: () => activeMode.get(),
    register: (mode: string, api: EditorModeApi) => {
      availableModes.set(registerMode(availableModes.get(), mode, api));
    }
  };
};
