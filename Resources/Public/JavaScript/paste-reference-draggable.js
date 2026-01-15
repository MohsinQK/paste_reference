/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

class Draggable { //extends GuiElement {
  // context: DOM
  #element = [];
  #elementType = '';
  #id = 0;

  // context: TYPO3
  #uid = 0;
  #pid = 0;
  #colpos = 0;
  #txContainerParent = null;
  #languageUid = 0;
  #sorting = 0;

  constructor(element = 0) {
    this.reset();
    this.init(element);
  }

  reset() {
    // context: DOM
    this.#element = [];
    this.#elementType = '';
    this.#id = 0;

    // context: TYPO3
    this.#uid = 0;
    this.#pid = 0;
    this.#colpos = 0;
    this.#txContainerParent = null;
    this.#languageUid = 0;
    this.#sorting = 0;
  }

  /**
   * @context DOM
   */
  init(element, allowId = false) {
    let foundElement;
    if (element) {
      if (typeof element === 'object') {
        // DOM
        this.setFromElement(element);
        foundElement = true;
      } else if (allowId) {
        foundElement = document.querySelector(element);
        if (foundElement && typeof foundElement === 'object') {
          this.setFromElement(foundElement);
        }
      }
    }
    // if (!foundElement) {
    //  throw new Error((allowId ? 'DOM element or id expected' : 'DOM element expected'));
    // }
  }

  /**
   * Sets element (object) from DOM element with comprehensive data extraction
   * @context DOM, TYPO3
   * @param {Element} element - DOM element to set
   * @return this
   */
  setFromElement(element) {
    try {
      if (!element) {
        throw new Error('Cannot set properties from null or undefined element');
      }

      this.setElement(element);
      if (element.id) {
        this.#id = this.setId(element);
      }

      // Extract TYPO3 data from element and its context
      if (element.dataset) {
        if (element.dataset.uid) {
          this.setUid(parseInt(element.dataset.uid, 10));
        }

        if (element.dataset.page) {
          this.setPid(parseInt(element.dataset.page, 10));
        }

        if (element.dataset.sorting) {
          this.setSorting(parseInt(element.dataset.sorting, 10));
        }
      }

      // Extract column position from closest container
      const colpos = Draggable.getColumnForElement(element);
      if (colpos !== null && colpos !== undefined) {
        this.setColpos(colpos);
      }

      // Extract language UID
      const languageUid = Draggable.getLanguageForElement(element);
      if (languageUid !== null && languageUid !== undefined) {
        this.setLanguageUid(languageUid);
      }

      // Extract txContainerParent
      const txContainerParent = Draggable.getTxContainerParentForElement(element);
      if (txContainerParent) {
        this.setTxContainerParent(txContainerParent);
      }

      // Extract page ID from page context if not found in element
      if (this.#pid <= 0) {
        const pageElement = document.querySelector('[data-page]');
        if (pageElement && pageElement.dataset.page) {
          this.setPid(parseInt(pageElement.dataset.page, 10));
        }
      }

      // Reset container context to force re-detection
      // this.#containerContext = null;

    } catch (error) {
      console.error('Error setting element data:', error);
      throw error;
    }
    return this;
  }

  /**
   * element (object)
   * @context DOM
   * @param (object) element
   * @return this
   */
  setElement(element) {
    this.#element = element;
    this.#setElementType(element);
    return this;
  }

  getElement() {
    return this.#element;
  }

  /**
   * elementType based on DOM
   * Results in upper case element-name for HTML-elements (DIV, SPAN, BUTTON, ...)
   * or types like STRING, INT, etc. for other code-fragments.
   *
   * Always called when element is set.
   * Private to avoid independent handling.
   * @context DOM
   * @param (object) element
   * @return void
   */
  #setElementType(element) {
    let elementType = typeof element;
    if (typeof element == 'object') {
      if (element.tagName) {
        elementType = element.tagName;
      } else {
        elementType = Object.prototype.toString.call(element);
      }
    }
    this.#elementType = elementType;
  }

  getElementType() {
    return this.#elementType;
  }

  /**
   * id
   * @context DOM
   * @param (string) id
   * @return this
   */
  setId(id) {
    this.#id = id;
    return this;
  }

  getId() {
    return this.#id;
  }

  /** ----------------------------------------- */

  /**
   * record-uid
   * @context TYPO3
   * @param (int) uid
   * @return this
   */
  setUid(uid) {
    this.#uid = parseInt(uid, 10);
    return this;
  }

  getUid() {
    return this.#uid;
  }

  /**
   * page-id
   * @context TYPO3
   * @param (int) pid
   * @return this
   */
  setPid(pid) {
    this.#pid = parseInt(pid, 10);
    return this;
  }

  getPid() {
    return this.#pid;
  }

  /**
   * colpos
   * @context TYPO3
   * @param (int) colpos
   * @return this
   */
  setColpos(colpos) {
    if (colpos !== false && colpos !== null) {
      this.#colpos = parseInt(colpos, 10);
    }
    return this;
  }

  getColpos() {
    return this.#colpos;
  }

  /**
   * txContainerParent
   * @context TYPO3
   * @param {object | int | string} item
   * @return this
   */
  setTxContainerParent(item) {
    try {
      let parentElementUid;
      if (typeof item === 'object' && item !== null) {
        parentElementUid = Draggable.getTxContainerParentForElement(element);
      } else if (typeof item === 'number') {
        parentElementUid = item;
      } else if (typeof item === 'string' && parseInt(item, 10)) {
        parentElementUid = parseInt(item, 10);
      }

      if (parentElementUid && parentElementUid > 0) {
        this.#txContainerParent = parentElementUid;
      } else {
        this.#txContainerParent = null;
      }
    } catch (error) {
      console.error('Error setting txContainerParent:', error);
      this.#txContainerParent = null;
    }
    return this;
  }

  getTxContainerParent() {
    return this.#txContainerParent;
  }

  /**
   * languageUid {int}
   * @context TYPO3
   */
  setLanguageUid(languageUid) {
    this.#languageUid = parseInt(languageUid, 10);
    return this;
  }

  getLanguageUid() {
    return this.#languageUid;
  }

  /**
   * sorting {int}
   * @context TYPO3
   */
  setSorting(sorting) {
    if (sorting !== false && sorting !== null) {
      this.#sorting = parseInt(sorting);
    }
    return this;
  }

  getSorting() {
    return this.#sorting;
  }

  /**
   * @context TYPO3
   */
  // static determineColumn(element) {
  static getColumnForElement(item) {
    const postfix = ' (colpos 0 assumed now)';
    try {
      let element = item;
      // if 'item' is an event, the element has to be fetched out of it
      if (item && item.type && item.type === 'click') {
        element = item.srcElement || item.target;
      }

      if (!element || !element.closest('[data-colpos]')) {
        console.warn('Invalid element provided to get column' + postfix);
        return 0;
      }

      /*
      // is element td.t3js-page-column for first button in the column
      // with distinct class to determine the column (for example like t3-grid-cell-left_col)
      // else it's a div.t3-page-ce-wrapper
      const columnContainer = element.closest('[data-colpos]');
      if (!columnContainer || !columnContainer.dataset.colpos) {
        console.warn('No column container found for element' + postfix);
        return 0;
      }
      const colpos = parseInt(columnContainer.dataset.colpos, 10);
      */

      const colpos = parseInt(element.closest('[data-colpos]', 10));
      return isNaN(colpos) ? 0 : colpos;
    } catch (error) {
      console.error('Error getting column for element' * postfix + ':', error);
      return 0;
    }
  }

  /**
   * Creates unique id by merging all available element info
   * @context TYPO3
   */
  getUniqueId() {
    try {
      let uniqueId, uniqueIdParams = [];

      // Always start with element prefix for content elements
      if (this.#uid > 0) {
        uniqueIdParams.push('element');
      }

      // Add page ID (required)
      if (this.#pid > 0) {
        uniqueIdParams.push('page_' + this.#pid);
      } else {
        throw new Error('Invalid page ID for unique ID generation');
      }

      // Add txContainerParent if present (for container elements)
      if (this.#txContainerParent && this.#txContainerParent > 0) {
        uniqueIdParams.push('txContainerParent_' + this.#txContainerParent);
      }

      // Add column position (required)
      uniqueIdParams.push('colpos_' + this.#colpos);

      // Add content element UID - use target element UID if pasting after existing element
      const targetUid = this.getTargetElementUid();
      if (targetUid > 0) {
        // Pasting after an existing element
        uniqueIdParams.push('tt_content_' + targetUid);
      } else {
        // Pasting at the top or no existing elements
        uniqueIdParams.push('tt_content_0'); // + this.#uid);
      }

      uniqueId = uniqueIdParams.join('-');

      // Validate generated ID format
      if (!this.validateUniqueIdSyntax(uniqueId)) {
        throw new Error('Generated unique ID failed validation: ' + uniqueId);
      }

      return uniqueId;
    } catch (error) {
      console.error('Error generating unique ID:', error);
      // Fallback ID generation
      return this.generateFallbackId();
    }
  }

  /**
   * Generates a fallback ID when normal generation fails
   * @context TYPO3
   * @returns {string} - Fallback unique ID
   */
  generateFallbackId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fallbackId = prefix + `${timestamp}-${random}`;
    console.warn('Using fallback ID generation:', fallbackId);
    return fallbackId;
  }

  /**
   * returns the next "upper" txContainerParent parameter inside the code
   * @context TYPO3
   * @param element
   * @return int|boolean the containerParent
   */
  static getTxContainerParentForElement(element) {
    if (!element) {
      console.error('Error getting txContainerParent for undefined element.');
      return false;
    }
    try {
      if (element && !element.closest('[data-tx-container-parent]')) {
        return false;
      }

      const gridContainer = element.closest('[data-tx-container-parent]');
      if (!gridContainer || !gridContainer.dataset) {
        return false;
      }

      const txContainerParent = gridContainer.dataset.txContainerParent;
      if (txContainerParent === undefined || txContainerParent === 'undefined') {
        return false;
      }

      const parentUid = parseInt(txContainerParent, 10);
      return isNaN(parentUid) || parentUid <= 0 ? false : parentUid;
    } catch (error) {
      console.error('Error getting TxContainerParent for element:', error);
      return false;
    }
  }

  /**
   * @context TYPO3
   */
  static getLanguageForElement(element) {
    const postfix = ' (language-uid 0 assumed now)';
    try {
      if (!element || !element.closest('[data-language-uid]')) {
        console.warn('Invalid element provided to getLanguageForElement' + postfix);
        return 0;
      }

      const languageContainer = element.closest('[data-language-uid]');
      if (!languageContainer || !languageContainer.dataset.languageUid) {
        console.warn('No language container found for element' + postfix);
        return 0;
      }

      const languageUid = parseInt(languageContainer.dataset.languageUid, 10);
      return isNaN(languageUid) ? 0 : languageUid;
    } catch (error) {
      console.error('Error getting language for element' + postfix + ': ', error);
      return 0;
    }
  }

  /**
   * Gets the UID of the target element we're pasting after
   * Returns 0 only for the very first button bar (standalone, not in any content element wrapper)
   * Returns the content element UID for button bars that are inside content element wrappers
   * @context TYPO3
   * @returns {number} UID of parent content element, or 0 for standalone first button
   */
  getTargetElementUid() {
    try {
      /*
      // Look for different types of button areas and buttons
      let targetArea = null;

      if (this.#element && this.#element.closest) {
        // Try different possible button area selectors
        targetArea = this.#element.closest('.t3js-page-new-ce') ||
                    this.#element.closest('.t3js-paste-new') ||
                    this.#element.closest('[class*="paste"]') ||
                    this.#element.closest('[class*="new-ce"]');

        // Also try to find by icon identifiers (for container columns)
        if (!targetArea) {
          // Look for elements containing specific icons
          const iconElement = this.#element.closest('[data-identifier="actions-plus"]') ||
                             this.#element.closest('[data-identifier="actions-insert-reference"]') ||
                             this.#element.querySelector('[identifier="actions-plus"]') ||
                             this.#element.querySelector('[identifier="actions-insert-reference"]');

          if (iconElement) {
            targetArea = iconElement.closest('.t3js-page-new-ce') ||
                        iconElement.closest('.t3-page-ce-actions') ||
                        iconElement.parentElement;
          }
        }
      }
      */

      // if (targetArea) {

        // Check if this button area is inside a content element wrapper
        const parentContentElement = this.#element.closest('.t3js-page-ce');

        if (parentContentElement) {
          // This button is inside a content element wrapper
          // Use the UID of that content element
          const uid = parentContentElement.dataset?.uid;
          return uid ? parseInt(uid, 10) : 0;
        } else {
          // This button is standalone (not inside any content element wrapper)
          // This means it's the very first button bar at the top
          return 0;
        }

      // }

      // Default: not a button area
      return 0;
    } catch (error) {
      console.error('Error getting target element UID:', error);
      return 0;
    }
  }

  /**
   * Validates the format of a generated unique ID
   * @context TYPO3
   * @param {string} id - The ID to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  validateUniqueIdSyntax(id) {
    if (!id || typeof id !== 'string') {
      return false;
    }

    // Check for required components
    const hasPageId = /page_\d+/.test(id);
    const hasColpos = /colpos_\d+/.test(id);
    const hasTtContent = /tt_content_\d+/.test(id);

    return hasPageId && hasColpos && hasTtContent;
  }

  /**
   * Validates container hierarchy and relationships
   * @context TYPO3
   * @param {Element} containerElement - The container element to validate
   * @returns {boolean} True if hierarchy is valid
  validateContainerHierarchy(containerElement) {
    try {
      if (!containerElement) return false;

      // Check if container has required data attributes
      const hasContainerParent = containerElement.dataset.txContainerParent !== undefined;
      const hasColpos = containerElement.closest('[data-colpos]') !== null;

      if (!hasContainerParent || !hasColpos) {
        console.warn('Container element missing required data attributes');
        return false;
      }

      // Check for circular references (container cannot be its own parent)
      const parentUid = parseInt(containerElement.dataset.txContainerParent, 10);
      const elementUid = this.#uid;

      if (parentUid === elementUid && elementUid > 0) {
        console.error('Circular container reference detected');
        return false;
      }

      // Validate nested container depth (prevent excessive nesting)
      const maxDepth = 5;
      let currentElement = containerElement;
      let depth = 0;

      while (currentElement && depth < maxDepth) {
        currentElement = currentElement.parentElement?.closest('[data-tx-container-parent]');
        depth++;
      }

      if (depth >= maxDepth) {
        console.warn('Container nesting depth exceeds maximum allowed');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating container hierarchy:', error);
      return false;
    }
  }
   */

  /**
   * Validates element placement within container hierarchy
   * @context TYPO3
   * @returns {boolean} True if placement is valid
  validatePlacement() {
    try {
      // Basic validation
      if (this.#pid <= 0) {
        console.error('Invalid page ID for element placement');
        return false;
      }

      if (this.#colpos < 0) {
        console.error('Invalid column position for element placement');
        return false;
      }

      // Container-specific validation
      const context = this.getContainerContext();
      if (context.isContainer) {
        if (!context.hasValidHierarchy) {
          console.error('Invalid container hierarchy for element placement');
          return false;
        }

        if (context.parentUid <= 0) {
          console.error('Invalid container parent UID');
          return false;
        }

        // Validate that container parent exists in DOM
        const parentElement = document.querySelector(`[data-uid="${context.parentUid}"]`);
        if (!parentElement) {
          console.error('Container parent element not found in DOM');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating element placement:', error);
      return false;
    }
  }
  */

  /**
   * Checks if the current element is the standalone first button bar (not inside any content element wrapper)
   * Only returns true for the very first button that is not wrapped inside a content element
   * @context TYPO3
   * @param {Element} containerElement - The container element
   * @returns {boolean} True if standalone first button (not wrapped in content element)
  isFirstElementInContainer(containerElement) {
    try {
      if (!containerElement) return false;

      // Look for different types of button areas and buttons
      let targetArea = null;

      if (this.#element && this.#element.closest) {
        // Try different possible button area selectors
        targetArea = this.#element.closest('.t3js-page-new-ce') ||
                    this.#element.closest('.t3js-paste-new') ||
                    this.#element.closest('[class*="paste"]') ||
                    this.#element.closest('[class*="new-ce"]');

        // Also try to find by icon identifiers (for container columns)
        if (!targetArea) {
          // Look for elements containing specific icons
          const iconElement = this.#element.closest('[data-identifier="actions-plus"]') ||
                             this.#element.closest('[data-identifier="actions-insert-reference"]') ||
                             this.#element.querySelector('[identifier="actions-plus"]') ||
                             this.#element.querySelector('[identifier="actions-insert-reference"]');

          if (iconElement) {
            targetArea = iconElement.closest('.t3js-page-new-ce') ||
                        iconElement.closest('.t3-page-ce-actions') ||
                        iconElement.parentElement;
          }
        }
      }

      if (targetArea) {
        // Check if this button area is inside a content element wrapper
        const parentContentElement = targetArea.closest('.t3js-page-ce');

        if (parentContentElement) {
          // This button is inside a content element wrapper
          // It's not the first element (it's after the content element it's wrapped in)
          return false;
        } else {
          // This button is standalone (not inside any content element wrapper)
          // This means it's the very first button bar at the top
          return true;
        }
      }

      // For existing content elements, they are never "first" in the sense of being standalone
      return false;
    } catch (error) {
      console.error('Error checking first element status:', error);
      return false;
    }
  }
   */

  /**
   * Detects and returns container context information for the element
   * @context TYPO3
   * @returns {object} Container context object
  getContainerContext() {
    // if (this.#containerContext !== null) {
    //  return this.#containerContext;
    // }

    try {
      const context = {
        isContainer: false,
        parentUid: null,
        containerColpos: null,
        isFirstElement: false,
        targetSorting: 0,
        hasValidHierarchy: true
      };

      // Check if element is within a container
      if (this.#element && this.#element.closest /* TODO * /) {
        const containerElement = this.#element.closest('[data-tx-container-parent]');
        if (txContainerParent && txContainerParent.dataset.txContainerParent) {
          context.isContainer = true;
          context.parentUid = parseInt(txContainerParent.dataset.txContainerParent, 10);

          // Get container column position - use the element's colpos, not the container's
          context.containerColpos = this.#colpos;

          // Check if this is the first element in the specific container column
          context.isFirstElement = this.isFirstElementInContainer(txContainerParent);

          // Determine target sorting based on first element status
          context.targetSorting = context.isFirstElement ? 0 : null; // this.calculateContainerSorting();

          // Validate container hierarchy
          context.hasValidHierarchy = this.validateContainerHierarchy(containerElement);

          console.log('Container context detected:', {
            parentUid: context.parentUid,
            containerColpos: context.containerColpos,
            isFirstElement: context.isFirstElement,
            targetSorting: context.targetSorting,
            elementColpos: this.#colpos,
            targetElementUid: this.getTargetElementUid()
          });
        }
      }

      this.#containerContext = context;
      return context;
    } catch (error) {
      console.error('Error detecting container context:', error);
      return {
        isContainer: false,
        parentUid: null,
        containerColpos: null,
        isFirstElement: false,
        targetSorting: 0,
        hasValidHierarchy: false,
        error: error.message
      };
    }
  }
  */

  /**
   * Calculates appropriate sorting value for container placement
   * @context TYPO3
   * @returns {number} Calculated sorting value
  calculateContainerSorting() {
    try {
      const context = this.#containerContext || this.getContainerContext();

      if (context.isFirstElement) {
        return 0;
      }

      // If we have a specific sorting value, use it
      if (this.#sorting > 0) {
        return this.#sorting;
      }

      // Default to a reasonable sorting value
      return 256;
    } catch (error) {
      console.error('Error calculating container sorting:', error);
      return 256;
    }
  }
   */

}

export default Draggable;
