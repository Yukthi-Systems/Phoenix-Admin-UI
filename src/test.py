def parse_pflogsum_report(raw_report: str) -> dict:
    """
    Parse the pflogsumm report and extract grand totals.
    :param raw_report: The raw pflogsumm report as a string
    :return: A dictionary containing the grand totals
    """
    try:
        heading = get_first_line(raw_report)
        grand_totals = get_grand_totals(raw_report)
        host_domain_summary_received = parse_msg_received_section(raw_report)
        senders_by_message_count = parse_top_section(raw_report, "Senders by message count")
        recipients_by_message_count = parse_top_section(raw_report, "Recipients by message count")
        message_reject_detail = parse_hierarchical_section(raw_report, "message reject detail")
        message_deferral_detail = parse_hierarchical_section(raw_report, "message deferral detail")
        message_reject_warning_detail = parse_hierarchical_section(raw_report, "message reject warning detail")
        message_hold_detail = parse_hierarchical_section(raw_report, "message hold detail")
        message_discard_detail = parse_hierarchical_section(raw_report, "message discard detail")
        smtp_delivery_failures = parse_simple_section(raw_report, "smtp delivery failures")
        fatal_errors = parse_simple_section(raw_report, "Fatal Errors")
        panics_response = parse_simple_section(raw_report, "Panics")
        warnings_response = parse_warning_error_section(raw_report, "Warnings")
        master_daemon_messages = parse_simple_section(raw_report, "Master daemon messages")

        return {
            "heading": heading,
            "grand_totals": grand_totals,
            "host_domain_summary_received": host_domain_summary_received,
            "senders_by_message_count": senders_by_message_count,
            "recipients_by_message_count": recipients_by_message_count,
            "message_deferral_detail": message_deferral_detail,
            "message_reject_detail": message_reject_detail,
            "message_reject_warning_detail": message_reject_warning_detail,
            "message_hold_detail": message_hold_detail,
            "message_discard_detail": message_discard_detail,
            "smtp_delivery_failures": smtp_delivery_failures,
            "fatal_errors": fatal_errors,
            "panics": panics_response,
            "warnings": warnings_response,
            "master_daemon_messages": master_daemon_messages
        }

    except Exception as e:
        logging.error(f"Error while parsing pflogsumm report: {e}", exc_info=True)
        return {}